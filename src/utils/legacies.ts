import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export interface Legacy {
  name: string;
  text: string;
}

export const useLegacies = () => {
  const [legacies, setLegacies] = useState<Legacy[]>([]);

  useEffect(() => {
    fetch('/legacies.csv')
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse<Legacy>(csvText, {
          header: true,
          complete: (results) => {
            // Filter out any empty rows
            const validLegacies = results.data.filter(
              (legacy) => legacy.name && legacy.name.trim() !== ''
            );
            setLegacies(validLegacies);
          },
        });
      })
      .catch((error) => console.error('Error fetching legacies:', error));
  }, []);

  return legacies;
};

export const getLegacyGroups = (legacies: Legacy[]): Legacy[][] => {
  if (legacies.length === 0) {
    return [];
  }
  return [
    legacies.slice(0, 5),
    legacies.slice(5, 10),
    legacies.slice(10, 15),
    legacies.slice(15, 20),
    legacies.slice(20, 25),
    legacies.slice(25, 30),
  ];
};
