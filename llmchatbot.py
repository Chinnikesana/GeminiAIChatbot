# -*- coding: utf-8 -*-
"""LLMchatbot.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1s6rLrEgRo3dSu8hqJRZA7gN_L3-uZLAp
"""

import json
import os
import urllib
import torch
import ssl

def download_and_load_file(file_path,url):
  ssl_context=ssl.create_default_context()
  ssl_context.check_hostname=False
  ssl_context.verify_mode=ssl.CERT_NONE

  if not os.path.exists(file_path):
    with urllib.request.urlopen(url,context=ssl_context) as response:
      text_data=response.read().decode("utf-8")
    with open(file_path,"w") as file:
      file.write(text_data)
  else:
    with open(file_path,"r",encoding="utf-8") as file:
      text_data=file.read()

  with open(file_path,"r",encoding="utf-8") as file:
    data=json.load(file)

  return data

"""Data preprocessing"""

file_path = "instruction-data.json"
url = (
    "https://raw.githubusercontent.com/rasbt/LLMs-from-scratch"
    "/main/ch07/01_main-chapter-code/instruction-data.json"
)

data=download_and_load_file(file_path,url)
print("number of entries:",len(data))

data[5]

data[10]["instruction"]

def format_input(entry):
  instruction_text=(
     f"Below is an instruction that describes a task. "
        f"Write a response that appropriately completes the request."
        f"\n\n### Instruction:\n{entry['instruction']}"
  )

  input_text=f"\n\n### Input:\n {entry['input']}" if entry["input"] else ""

  return instruction_text+input_text

print(format_input(data[50]))

train_portion=int(len(data)*0.85)
test_portion=int(len(data)*0.1)
val_portion=len(data)-train_portion-test_portion
print(train_portion,val_portion,test_portion)

train_data=data[:train_portion]
test_data=data[train_portion:train_portion+test_portion]
val_data=data[train_portion+test_portion:]

from torch.utils.data import Dataset

class InstructionDataset(Dataset):
  def __init__(self,data,tokenizer):
    self.data=data
    self.encoded_texts=[]
    for entry in data:
      instruction_input=format_input(entry)
      res=f"\n\n### Response:\n {entry['output']}"
      full_text=instruction_input+res
      self.encoded_texts.append(
          tokenizer.encode(full_text)
      )

  def __getitem__(self, index):
    return self.encoded_texts[index]

  def __len__(self):
    return len(self.data)

!pip install tiktoken

import tiktoken
tokenizer=tiktoken.get_encoding("gpt2")
tokenizer.encode("<|endoftext|>",allowed_special={"<|endoftext|>"})
print(InstructionDataset(data[:2],tokenizer))



def custom_collate_fn(batch, pad_token_id=50256, ignore_index=-100, allowed_max_len=None, device="cpu"):
  max_len = max(len(entry) + 1 for entry in batch)

  input_lst, target_lst = [], []
  for entry in batch:
    # Call the copy method to create a copy of entry
    new_item = entry.copy()
    new_item += [pad_token_id]
    padded = (new_item + [pad_token_id] * (max_len - len(new_item)))

    inputs = torch.tensor(padded[:-1])
    target = torch.tensor(padded[1:])

    mask = target == pad_token_id
    indicies = torch.nonzero(mask).squeeze()
    if indicies.numel() > 1:
      target[indicies[1:]] = ignore_index
    if allowed_max_len is not None:
      inputs = inputs[:allowed_max_len]
      target = target[:allowed_max_len]

    input_lst.append(inputs)
    target_lst.append(target)

  input_tensor = torch.stack(input_lst).to(device)
  target_tensor = torch.stack(target_lst).to(device)

  return input_tensor, target_tensor

train_portion,test_portion,val_portion

from torch.utils.data import DataLoader

num_workers=0
batch_size=8

torch.manual_seed(123)

train_dataset=InstructionDataset(train_data,tokenizer)

train_loader=DataLoader(train_dataset,batch_size=batch_size,
                        collate_fn=custom_collate_fn,
                        shuffle=True,
                        drop_last=True,
                        num_workers=num_workers
                        )

val_dataset=InstructionDataset(val_data,tokenizer)

val_loader=DataLoader(val_dataset,
                      batch_size=batch_size,
                      collate_fn=custom_collate_fn,
                      shuffle=False,
                      drop_last=True,
                      num_workers=num_workers

                      )

test_dataset=InstructionDataset(test_data,tokenizer)
test_loader=DataLoader(test_dataset,
                       batch_size=batch_size,
                       collate_fn=custom_collate_fn,
                       shuffle=False,
                       drop_last=True,
                       num_workers=num_workers
                       )

import torch.nn as nn
class MultiHeadAttention(nn.Module):
  def __init__(self,d_in,d_out,context_length,dropout,num_heads,qkv_bias=False):
    super().__init__()
    assert(d_out % num_heads==0),\
    "d_out must be divisible by num_heads"

    self.d_out=d_out
    self.num_heads=num_heads
    self.head_dim=d_out//num_heads
    self.W_query=nn.Linear(d_in,d_out,bias=qkv_bias)
    self.W_key=nn.Linear(d_in,d_out,bias=qkv_bias)
    self.W_value=nn.Linear(d_in,d_out,bias=qkv_bias)
    self.out_proj=nn.Linear(d_out,d_out)
    self.dropout=nn.Dropout(dropout)
    self.register_buffer("mask",torch.triu(torch.ones(context_length,context_length),diagonal=1))

  def forward(self,x):
    b,num_tokens,d_in=x.shape
    keys=self.W_key(x)
    values=self.W_value(x)
    queries=self.W_query(x)

    keys=keys.view(b,num_tokens,self.num_heads,self.head_dim)
    values=values.view(b,num_tokens,self.num_heads,self.head_dim)
    queries=queries.view(b,num_tokens,self.num_heads,self.head_dim)


    keys=keys.transpose(1,2)
    queries=queries.transpose(1,2)
    values=values.transpose(1,2)



    attn_scores=queries @ keys.transpose(2,3)
    mask_bool=self.mask.bool()[:num_tokens, :num_tokens]

    attn_scores.masked_fill_(mask_bool,-torch.inf)

    attn_weights=torch.softmax(attn_scores/keys.shape[-1]**0.5,dim=-1)

    attn_weights=self.dropout(attn_weights)

    context_vec=(attn_weights @ values).transpose(1,2)
    context_vec=context_vec.contiguous().view(b,num_tokens,self.d_out)
    context_vec=self.out_proj(context_vec)

    return context_vec

class LayerNorm(nn.Module):
  def __init__(self,emb_dim):
    super().__init__()
    self.eps=1e-5
    self.scale=nn.Parameter(torch.ones(emb_dim))
    self.shift=nn.Parameter(torch.zeros(emb_dim))


  def forward(self,x):
    mean=x.mean(dim=-1,keepdim=True)
    var=x.var(dim=-1,keepdim=True,unbiased=False)
    norm_x=(x-mean)/torch.sqrt(var+self.eps)
    return self.scale *norm_x+self.shift


class GELUActivation(nn.Module):
  def __init__(self):
    super().__init__()

  def forward(self,x):
    return 0.5*x*(1+torch.tanh(torch.sqrt(torch.tensor(2/torch.pi))*(x+0.044715*torch.pow(x,3))
    ))

class FeedForward(nn.Module):
  def __init__(self, cfg):
    super().__init__()
    self.layers=nn.Sequential(nn.Linear(cfg["emb_dim"],4*cfg["emb_dim"]),
                              GELUActivation(),
                              nn.Linear(4*cfg["emb_dim"],cfg["emb_dim"])

                              )

  def forward(self,x):
    return self.layers(x)


class TransformerBlock(nn.Module):
  def __init__(self,cfg):
    super().__init__()
    self.att=MultiHeadAttention(
        d_in=cfg["emb_dim"],
        d_out=cfg["emb_dim"],
        context_length=cfg["context_length"],
        num_heads=cfg["n_heads"],
        dropout=cfg["drop_rate"],
        qkv_bias=cfg["qkv_bias"]
    )
    self.ff=FeedForward(cfg)
    self.norm1=LayerNorm(cfg["emb_dim"])
    self.norm2=LayerNorm(cfg["emb_dim"])
    self.drop_shortcut=nn.Dropout(cfg["drop_rate"])


  def forward(self,x):
    shortcut=x
    x=self.norm1(x)
    x=self.att(x)
    x=self.drop_shortcut(x)
    x=x+shortcut

    shortcut=x
    x=self.norm2(x)
    x=self.ff(x)
    x=self.drop_shortcut(x)
    x=x+shortcut

    return x

#model architecture
class GPTModel(nn.Module):
  def __init__(self,cfg):
    super().__init__()
    self.tok_emb=nn.Embedding(cfg["vocab_size"],cfg["emb_dim"])
    self.pos_emb=nn.Embedding(cfg["context_length"],cfg["emb_dim"])
    self.drop_emb=nn.Dropout(cfg["drop_rate"])

    self.trf_blocks=nn.Sequential(
        *[TransformerBlock(cfg) for _ in range(cfg["n_layers"])]
    )
    self.final_norm=LayerNorm(cfg["emb_dim"])
    self.out_head=nn.Linear(cfg["emb_dim"],cfg["vocab_size"],bias=False)
    # print("heads: ",self.out_head)
  def forward(self,in_idx):
    batch_size, seq_len=in_idx.shape
    tok_embeds=self.tok_emb(in_idx)
    pos_embeds=self.pos_emb(torch.arange(seq_len,device=in_idx.device))

    x=tok_embeds+pos_embeds
    x=self.drop_emb(x)
    x=self.trf_blocks(x)
    x=self.final_norm(x)
    logits=self.out_head(x)
    return logits

device=torch.device("cuda" if torch.cuda.is_available() else "cpu")

def generate(model,idx,new_tokens,context_size,temperature=0.0, top_k=None,eos_id=None):
  for _ in range(new_tokens):
    idx_cond=idx[:,-context_size:]
    with torch.no_grad():
      logits=model(idx_cond)
    logits=logits[:,-1,:]
    if top_k is not None:
      top_logits,_=torch.topk(logits,top_k)
      min_val=top_logits[:,-1]
      logits=torch.where(logits<min_val,torch.tensor(float("-inf")).to(logits.device),logits)
    if temperature >0.0:
      logits=logits/temperature

      probs=torch.softmax(logits,dim=-1)

      idx_next=torch.multinomial(probs,num_samples=1)

    else:
      idx_next=torch.argmax(logits,dim=-1,keepdim=True)

    if idx_next==eos_id:
      break

    idx=torch.cat((idx,idx_next),dim=1)

  return idx

def cal_loss_batch(input_batch,target_batch,model,device):
  input_batch,target_batch=input_batch.to(device), target_batch.to(device)

  logits=model(input_batch)
  loss=torch.nn.functional.cross_entropy(logits.flatten(0,1),target_batch.flatten())

  return loss

def cal_loss_loader(data_loader,model,device,num_batches=None):
  total_loss=0
  if(len(data_loader))==0:
    return float("nan")

  elif num_batches is None:
    num_batches=len(data_loader)
  else:
    num_batches=min(num_batches,len(data_loader))
    for i,(input_batch,target_batch) in enumerate(data_loader):
      if i< num_batches:
        loss=cal_loss_batch(input_batch,target_batch,model,device)
        total_loss+=loss.item()
      else:
        break
  return total_loss/num_batches


def evaluate_model(model,train_loader,val_loader,device,eval_iter):
  model.eval()
  with torch.no_grad():
    train_loss=cal_loss_loader(train_loader,model,device,eval_iter)
    val_loss=cal_loss_loader(val_loader,model,device,eval_iter)
  model.train()
  return train_loss,val_loss

def generate_text_simple(model,idx,max_new_tokens,context_size):
  for _ in range(max_new_tokens):
    idx_cond=idx[:,-context_size:]

    # print("idx is here:",idx_cond)

    with torch.no_grad():
      logits=model(idx_cond)

    logits=logits[:,-1,:]

    probs=torch.softmax(logits,dim=-1)
    # print("probs:",probs)


    idx_next=torch.argmax(probs,dim=-1,keepdim=True)

    idx=torch.cat((idx,idx_next),dim=1)

  return idx




def generate_and_print_sample(model,tokenizer,device,start_context,max_new_tokens):
  model.eval()
  context_size=model.pos_emb.weight.shape[0]

  encoded=text_to_token_ids(start_context,tokenizer).to(device)
  with torch.no_grad():
    tokens_ids=generate_text_simple(model=model, idx=encoded, max_new_tokens=max_new_tokens,context_size=context_size)
    print("token ids shape is :",tokens_ids.shape)
    decoded_text=token_ids_to_text(tokens_ids,tokenizer)
    decoded_text=decoded_text.replace("\n"," ")
    print("response is:\n",decoded_text)

    model.train()


def text_to_token_ids(text,tokenizer):
  encoded=tokenizer.encode(text,allowed_special={'<|endoftext|>'})
  encoded_tensor=torch.tensor(encoded).unsqueeze(0)
  return encoded_tensor

def token_ids_to_text(token_ids,tokenizer):
  flat=token_ids.squeeze(0)
  return tokenizer.decode(flat.tolist())


#

from gpt_download3 import download_and_load_gpt2

BASE_CONFIG={
    "vocab_size": 50257,     # Vocabulary size
    "context_length": 1024,  # Context length
    "drop_rate": 0.0,        # Dropout rate
    "qkv_bias": True
}
model_configs = {
    "gpt2-small (124M)": {"emb_dim": 768, "n_layers": 12, "n_heads": 12},
    "gpt2-medium (355M)": {"emb_dim": 1024, "n_layers": 24, "n_heads": 16},
    "gpt2-large (774M)": {"emb_dim": 1280, "n_layers": 36, "n_heads": 20},
    "gpt2-xl (1558M)": {"emb_dim": 1600, "n_layers": 48, "n_heads": 25},
}


CHOOSE_MODEL="gpt2-medium (355M)"

BASE_CONFIG.update(model_configs[CHOOSE_MODEL])
model_size=CHOOSE_MODEL.split(" ")[-1].lstrip("(").rstrip(")")


import numpy as np


def assign(left,right):
  if left.shape !=right.shape:
    raise ValueError(f"shape mismatch. left:{left.shape},Right:{right.shape}")
  return torch.nn.Parameter(torch.tensor(right))

def load_weights_into_gpt(gpt, params):
    gpt.pos_emb.weight = assign(gpt.pos_emb.weight, params['wpe'])
    gpt.tok_emb.weight = assign(gpt.tok_emb.weight, params['wte'])

    for b in range(len(params["blocks"])):
        q_w, k_w, v_w = np.split(
            (params["blocks"][b]["attn"]["c_attn"])["w"], 3, axis=-1)
        gpt.trf_blocks[b].att.W_query.weight = assign(
            gpt.trf_blocks[b].att.W_query.weight, q_w.T)
        gpt.trf_blocks[b].att.W_key.weight = assign(
            gpt.trf_blocks[b].att.W_key.weight, k_w.T)
        gpt.trf_blocks[b].att.W_value.weight = assign(
            gpt.trf_blocks[b].att.W_value.weight, v_w.T)

        q_b, k_b, v_b = np.split(
            (params["blocks"][b]["attn"]["c_attn"])["b"], 3, axis=-1)
        gpt.trf_blocks[b].att.W_query.bias = assign(
            gpt.trf_blocks[b].att.W_query.bias, q_b)
        gpt.trf_blocks[b].att.W_key.bias = assign(
            gpt.trf_blocks[b].att.W_key.bias, k_b)
        gpt.trf_blocks[b].att.W_value.bias = assign(
            gpt.trf_blocks[b].att.W_value.bias, v_b)

        gpt.trf_blocks[b].att.out_proj.weight = assign(
            gpt.trf_blocks[b].att.out_proj.weight,
            params["blocks"][b]["attn"]["c_proj"]["w"].T)
        gpt.trf_blocks[b].att.out_proj.bias = assign(
            gpt.trf_blocks[b].att.out_proj.bias,
            params["blocks"][b]["attn"]["c_proj"]["b"])

        gpt.trf_blocks[b].ff.layers[0].weight = assign(
            gpt.trf_blocks[b].ff.layers[0].weight,
            params["blocks"][b]["mlp"]["c_fc"]["w"].T)
        gpt.trf_blocks[b].ff.layers[0].bias = assign(
            gpt.trf_blocks[b].ff.layers[0].bias,
            params["blocks"][b]["mlp"]["c_fc"]["b"])
        gpt.trf_blocks[b].ff.layers[2].weight = assign(
            gpt.trf_blocks[b].ff.layers[2].weight,
            params["blocks"][b]["mlp"]["c_proj"]["w"].T)
        gpt.trf_blocks[b].ff.layers[2].bias = assign(
            gpt.trf_blocks[b].ff.layers[2].bias,
            params["blocks"][b]["mlp"]["c_proj"]["b"])

        gpt.trf_blocks[b].norm1.scale = assign(
            gpt.trf_blocks[b].norm1.scale,
            params["blocks"][b]["ln_1"]["g"])
        gpt.trf_blocks[b].norm1.shift = assign(
            gpt.trf_blocks[b].norm1.shift,
            params["blocks"][b]["ln_1"]["b"])
        gpt.trf_blocks[b].norm2.scale = assign(
            gpt.trf_blocks[b].norm2.scale,
            params["blocks"][b]["ln_2"]["g"])
        gpt.trf_blocks[b].norm2.shift = assign(
            gpt.trf_blocks[b].norm2.shift,
            params["blocks"][b]["ln_2"]["b"])

    gpt.final_norm.scale = assign(gpt.final_norm.scale, params["g"])
    gpt.final_norm.shift = assign(gpt.final_norm.shift, params["b"])
    gpt.out_head.weight = assign(gpt.out_head.weight, params["wte"])


settings,params=download_and_load_gpt2(
    model_size=model_size,
    models_dir="/context"
)

model=GPTModel(BASE_CONFIG)

load_weights_into_gpt(model,params)
model.eval()

model.to(device)
torch.manual_seed(123)


def train_intruction_model(model,train_loader,val_loader,optimizer,device,num_epochs,eval_freq,eval_iter,start_context,tokenizer):
  train_losses,val_losses,track_tokens_seen=[],[],[]
  tokens_seen,global_step=0,-1

  for epoch in range(num_epochs):
    model.train()
    for input_batch,target_batch in train_loader:
      optimizer.zero_grad()
      loss=cal_loss_batch(input_batch,target_batch,model,device)
      loss.backward()
      optimizer.step()
      tokens_seen+=input_batch.shape.numel()
      global_step+=1

      if global_step % eval_freq==0:
        train_loss,val_loss=evaluate_model(model,train_loader,val_loader,device,eval_iter)
        train_losses.append(train_loss)
        val_losses.append(val_loss)
        track_tokens_seen.append(tokens_seen)
        print(f"EP {epoch+1} (setp {global_step:06d}):"
        f"train_loss {train_loss:.3f}, val loss: {val_loss:.3f}")
    generate_and_print_sample(model,tokenizer,device,start_context,max_new_tokens=20)

  return train_losses,val_losses,track_tokens_seen

import time
import torch
start_time=time.time()

torch.manual_seed(123)

optimizer=torch.optim .AdamW(model.parameters(),lr=0.00005,weight_decay=0.1)
import time
start_time=time.time()

torch.manual_seed(123)

optimizer=torch.optim.AdamW(model.parameters(),lr=0.00005,weight_decay=0.1)
import time
start_time=time.time()

torch.manual_seed(123)

optimizer=torch.optim.AdamW(model.parameters(),lr=0.00005,weight_decay=0.1)
num_epochs=2
train_losses,val_losses,tokens_seen=train_intruction_model(model,train_loader,val_loader,optimizer,device,num_epochs,eval_freq=5,eval_iter=5,start_context=format_input(val_data[-1]),tokenizer=tokenizer)

end_time=time.time()
total_time=(end_time-start_time)/60


print(f"total time taken for execution:{total_time:.2f} in min")

# max=int(input("enter max length of text to generate"))
start_text = format_input(val_data[-3])
generate_and_print_sample(model, tokenizer, device, start_text, max_new_tokens=50)



