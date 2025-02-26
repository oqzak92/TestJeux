import React, { useState } from 'react';


export function Inventaire() {
    const [inventory, setInventory] = useState([]);

    const addItem = (item) => {
        setInventory([...inventory, item]); // Ajoute un nouvel item
    };


    return (
        <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'rgba(0, 0, 0, 0.5)', padding: '10px', borderRadius: '10px' }}>
            <h3 style={{ color: 'white' }}>Inventaire</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
                {inventory.map((item, index) => (
                    <div key={index} style={{ padding: '5px', background: '#fff', borderRadius: '5px' }}>
                        {item}
                    </div>
                ))}
            </div>
            <button onClick={() => addItem('Potion')}>Ajouter une potion</button>
            <button onClick={() => addItem('santé')}>Ajouter une santé</button>
        </div>
    );
}