'use client';

const pad = (val: number) => val.toString().padStart(2, '0');

export const DurationDisplay = ({
  hours,
  minutes,
  seconds,
  label = 'Time Left:',
}: {
  hours: number;
  minutes: number;
  seconds: number;
  label?: string;
}) => {
  return (
    <div className="flex items-center space-x-1 text-sm text-gray-700">
      <span className="font-medium text-lg">{label}</span>
      <div className="bg-violet-200 px-2 py-1 rounded text-black font-semibold min-w-[32px] text-center text-lg">
        {pad(hours)}
      </div>
      <span>:</span>
      <div className="bg-violet-200 px-2 py-1 rounded text-black font-semibold min-w-[32px] text-center text-lg">
        {pad(minutes)}
      </div>
      <span>:</span>
      <div className="bg-violet-200 px-2 py-1 rounded text-black font-semibold min-w-[32px] text-center text-lg">
        {pad(seconds)}
      </div>
    </div>
  );
};
