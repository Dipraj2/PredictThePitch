/**
 * useSimulation.js
 * ────────────────
 * Custom hook managing simulation state:
 *  { simulate, result, isLoading, error, reset }
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { runSimulation } from '../api/simulateApi';

export function useSimulation() {
  const { session } = useAuth();
  const [result,    setResult]    = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  async function simulate(teamA, teamB) {
    if (!teamA || !teamB) {
      setError('Please select both teams.');
      return;
    }
    if (teamA === teamB) {
      setError('A team cannot play against itself.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await runSimulation(teamA, teamB, session?.access_token ?? null);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return { simulate, result, isLoading, error, reset };
}
