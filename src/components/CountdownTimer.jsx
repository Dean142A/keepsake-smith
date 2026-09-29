'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 22,
    minutes: 7,
    seconds: 46,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <div style={styles.container}>
      <div style={styles.timerBlock}>
        <div style={styles.timeDisplay}>
          <span>{pad(timeLeft.hours)}</span>
          <span style={styles.colon}>:</span>
          <span>{pad(timeLeft.minutes)}</span>
          <span style={styles.colon}>:</span>
          <span>{pad(timeLeft.seconds)}</span>
        </div>
        <div style={styles.labels}>
          <span>Hours</span>
          <span>Minutes</span>
          <span>Seconds</span>
        </div>
      </div>

      <div style={styles.dotsIndicator}>
        <span style={{ ...styles.dot, opacity: 0.3 }} />
        <span style={{ ...styles.dot, opacity: 1 }} />
        <span style={{ ...styles.dot, opacity: 0.3 }} />
      </div>

      <Link href="/customize" className="btn-pill btn-pill-dark">
        Order Now
      </Link>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '1.5rem 0',
    marginBottom: '1.5rem',
  },
  timerBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  timeDisplay: {
    fontSize: '1.6rem',
    fontWeight: '300',
    letterSpacing: '0.05em',
    color: '#FFFFFF',
    fontVariantNumeric: 'tabular-nums',
  },
  colon: {
    margin: '0 6px',
    opacity: 0.6,
  },
  labels: {
    display: 'flex',
    gap: '28px',
    fontSize: '0.65rem',
    color: '#777777',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  dotsIndicator: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
  },
};
