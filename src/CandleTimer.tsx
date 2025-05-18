import React, { useEffect, useState } from 'react';

interface CandleTimerProps {
    intervalMinutes: number; // 1 или 5, например
}

export function CandleTimer({ intervalMinutes }: CandleTimerProps) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        function updateTimer() {
            const now = new Date();

            const msPerInterval = intervalMinutes * 60 * 1000;
            const timeSinceEpoch = now.getTime();

            // Вычисляем, сколько прошло с последнего "выравненного" интервала
            const elapsedSinceIntervalStart = timeSinceEpoch % msPerInterval;

            // Считаем сколько осталось до следующего интервала
            const left = msPerInterval - elapsedSinceIntervalStart;

            setTimeLeft(left);
        }

        updateTimer(); // сразу вызываем

        const timerId = setInterval(updateTimer, 1000); // обновляем каждую секунду

        return () => clearInterval(timerId);
    }, [intervalMinutes]);

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    const pad = (num: number) => num.toString().padStart(2, '0');


    return (
        <div className="timer">
            {pad(minutes)}:{pad(seconds)}
        </div>
);
}
