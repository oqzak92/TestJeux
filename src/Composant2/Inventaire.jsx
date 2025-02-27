import React, { useState } from 'react';

export function Inventaire({ setHealth }) {
    const [inventory, setInventory] = useState([]);

    // Ajoute un item dans l'inventaire
    const addItem = (item) => {
        setInventory([...inventory, item]);
    };

    // Utilise un item (santé ici) et augmente la vie du joueur
    const useItem = (item) => {
        if (item === 'santé') {
            setHealth((prev) => Math.min(prev + 10, 100)); // Augmente la vie (max 100)
        }
        setInventory(inventory.filter((i) => i !== item)); // Supprime l'objet utilisé de l'inventaire
    };

    return (
        <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(0, 0, 0, 0.5)', padding: '10px', borderRadius: '10px' }}>
            <h3 style={{ color: 'white' }}>Inventaire</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
                {inventory.map((item, index) => (
                    <div key={index} style={{ padding: '5px', background: '#fff', borderRadius: '5px' }}>
                        {item}{" "}
                        {item === 'santé' && (
                            <button onClick={() => useItem(item)} style={{ marginLeft: '5px' }}>
                                Utiliser
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={() => addItem('Potion')}>Ajouter une potion</button>
            <button onClick={() => addItem('santé')}>Ajouter une santé</button>
        </div>
    );
}
