import React from 'react';

const TaipeiScaffoldPage = () => {
  return (
    <div className="w-full h-[calc(100vh-64px)] overflow-hidden">
      <iframe 
        src="http://localhost:5000/taipei_static/index.html" 
        className="w-full h-full border-none"
        title="Taipei Scaffold Map"
      />
    </div>
  );
};

export default TaipeiScaffoldPage;
