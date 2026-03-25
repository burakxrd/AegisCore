import { useState, useEffect } from 'react';

/**
 * Delays the updating of a value until after a specified timeout has elapsed
 * since the last time the value changed.
 */
export function useDebounce<T>(value: T, delayMs: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Cancel the timeout if value changes (also on component unmount)
    // This is how we prevent debounced value from updating if value is changed within the delay period.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
