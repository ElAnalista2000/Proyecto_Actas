import React from 'react';
import { useSeedData } from './hooks/useSeedData';
import { RestoreButton } from './components/RestoreButton';

function App() {
  const { data } = useSeedData();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestor Integral de Actas</h1>
        <RestoreButton />
      </header>
      <section>
        <h2 className="text-xl font-semibold mb-4">Aliados y compromisos</h2>
        <div className="space-y-4">
          {data.allies.map(ally => (
            <div key={ally.id} className="bg-white p-4 rounded shadow">
              <h3 className="text-lg font-medium mb-2">{ally.name}</h3>
              <ul className="list-disc list-inside space-y-1">
                {ally.commitments.map(c => (
                  <li key={c.id} className="text-gray-700">
                    <strong>{c.activity}</strong> – {c.responsible} – {c.dueDate}
                    {c.completed && <span className="ml-2 text-green-600">(Completado)</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
