'use client';

export default function LoginBackground() {
  return (
    <div 
      className="fixed inset-0 w-full h-full -z-10 bg-[#fafafa]" 
      aria-hidden 
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(200, 200, 200, 0.15) 0%, transparent 70%)'
      }}
    />
  );
}
