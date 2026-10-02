'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 22,
    minutes: 7,
    seconds: 46,
  });

  // Fetch live timer settings from database / settings.json
  useEffect(() => {
    let intervalId;

    const fetchTimerSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          const { targetEndTimestamp, timerHours, timerMinutes, timerSeconds } = data.settings;

          if (targetEndTimestamp) {
            const end = new Date(targetEndTimestamp).getTime();
            const now = Date.now();
            const diffSec = Math.max(0, Math.floor((end - now) / 1000));

            const h = Math.floor(diffSec / 3600);
            const m = Math.floor((diffSec % 3600) / 60);
            const s = diffSec % 60;

            setTimeLeft({ hours: h, minutes: m, seconds: s });
          } else {
            setTimeLeft({
              hours: timerHours ?? 22,
              minutes: timerMinutes ?? 7,
              seconds: timerSeconds ?? 46,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching timer settings:', err);
      }
    };

    fetchTimerSettings();

    intervalId = setInterval(() => {
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

    return () => clearInterval(intervalId);
  }, []);

  const pad = (num) => String(num).padStart(2, '0');

  return (
    <div style={styles.container}>
      {/* Timer Block: Numbers directly over their respective labels */}
      <div style={styles.timerBlock}>
        {/* Hours Unit */}
        <div style={styles.unitCol}>
          <span style={styles.numDisplay}>{pad(timeLeft.hours)}</span>
          <span style={styles.unitLabel}>hours</span>
        </div>

        <span style={styles.colon}>:</span>

        {/* Minutes Unit */}
        <div style={styles.unitCol}>
          <span style={styles.numDisplay}>{pad(timeLeft.minutes)}</span>
          <span style={styles.unitLabel}>minutes</span>
        </div>

        <span style={styles.colon}>:</span>

        {/* Seconds Unit */}
        <div style={styles.unitCol}>
          <span style={styles.numDisplay}>{pad(timeLeft.seconds)}</span>
          <span style={styles.unitLabel}>seconds</span>
        </div>
      </div>

      {/* Pagination Carousel Dots */}
      <div style={styles.dotsIndicator}>
        <span style={{ ...styles.dot, opacity: 0.3 }} />
        <span style={{ ...styles.dot, opacity: 1 }} />
        <span style={{ ...styles.dot, opacity: 0.3 }} />
      </div>

      {/* Order Now CTA Pill Button */}
      <Link href="/shop" className="btn-pill btn-pill-dark" style={styles.orderBtn}>
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
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  timerBlock: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.8rem',
  },
  unitCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '48px',
  },
  numDisplay: {
    fontSize: '2rem',
    fontWeight: '300',
    letterSpacing: '0.04em',
    color: '#D9D2C7',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '1',
  },
  unitLabel: {
    fontSize: '0.62rem',
    fontWeight: '300',
    color: '#888888',
    textTransform: 'lowercase',
    letterSpacing: '0.08em',
    marginTop: '6px',
    textAlign: 'center',
  },
  colon: {
    fontSize: '1.6rem',
    fontWeight: '300',
    color: '#888888',
    opacity: 0.7,
    lineHeight: '1',
    marginTop: '2px',
  },
  dotsIndicator: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  dot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
  },
  orderBtn: {
    padding: '0.65rem 2rem',
    fontSize: '0.85rem',
  },
};
