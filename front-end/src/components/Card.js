import React from 'react';

function Card({ text }) {
  return (
    <div className="bg-[#31C7DF] max-w-96 p-4 shadow-lg hover:bg-[#55d2e6] cursor-pointer transition-colors rounded-full items-center justify-center">
      <p className="text-center text-slate-100 text-[1.2rem] justify-center p-4">{text}</p>
    </div>
  );
}

export default Card;
