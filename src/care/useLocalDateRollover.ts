import {
  useEffect,
  useState,
} from "react";

function getMillisecondsUntilNextLocalDay(): number {
  const now = new Date();

  const nextDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    50,
  );

  return Math.max(
    nextDay.getTime() -
      now.getTime(),
    1,
  );
}

export function useLocalDateRollover(): number {
  const [
    rolloverToken,
    setRolloverToken,
  ] = useState(0);

  useEffect(() => {
    let timeoutId:
      | ReturnType<typeof setTimeout>
      | undefined;

    function scheduleNextRollover() {
      timeoutId = setTimeout(
        () => {
          setRolloverToken(
            (current) =>
              current + 1,
          );

          scheduleNextRollover();
        },
        getMillisecondsUntilNextLocalDay(),
      );
    }

    scheduleNextRollover();

    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  return rolloverToken;
}