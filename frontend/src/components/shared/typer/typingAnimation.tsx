// import React from 'react'
// import {TypeAnimation} from 'react-type-animation'
// const TypingAnimation=()=>{
//   return (
//     <TypeAnimation
//       sequence={[
//             // Same substring at the start will only be typed out once, initially
//             'Welcome to Gemini AI chat Bot 🤖',
//             1000, // wait 1s before replacing "Mice" with "Hamsters"
//             'This chatbot is a walking encyclopedia. Ask it anything!✨. ',
//             2000,
//             'Build using the Google Gemini API 💻',
//             1500,
//             'Hope you have great exprenece',
//             2000
//           ]}
//           // wrapper="span"
//           speed={50}
//           style={{ fontSize: '60px',color:'white', display: 'inline-block',
//             textShadow:'1px 1px 20px #000'
//            }}
//           repeat={Infinity}
//       />
//   );
// };
 

// export default TypingAnimation
import React, { useState, useEffect } from 'react';

const TypingAnimation = () => {
  const [text, setText] = useState('');
  const sequence = [
    'Welcome to Gemini AI Chat Bot 🤖',
    'Ask anything and get instant insights! ✨',
    'Powered by Google Gemini API',
    'Enjoy a seamless AI-driven experience',
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const typingSpeed = 75; // Speed of typing in ms
  const delayAfterTyping = 2500; // Time before erasing or moving to next sentence
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (charIndex < sequence[currentIndex].length) {
      const typeTimeout = setTimeout(() => {
        setText((prev) => prev + sequence[currentIndex].charAt(charIndex));
        setCharIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(typeTimeout);
    } else {
      const delayTimeout = setTimeout(() => {
        setText(''); // Clear text before moving to the next phrase
        setCharIndex(0);
        setCurrentIndex((prev) => (prev + 1) % sequence.length); // Loop over the sequence
      }, delayAfterTyping);

      return () => clearTimeout(delayTimeout);
    }
  }, [charIndex, currentIndex]);

  return (
    <div
      style={{
        fontSize: '50px',
        color: '#f4f4f4',
        fontFamily: 'Bold',
        fontWeight: 'bold',
        textAlign: 'center',
        
        textShadow: '2px 2px 10px rgba(0, 0, 0, 0.8)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {text}
    </div>
  );
};

export default TypingAnimation;
