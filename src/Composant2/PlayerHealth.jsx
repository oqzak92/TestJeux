import React, { useState } from 'react';

export function PlayerHealth() {
    const [health, setHealth] = useState(100); // 🔹 Déclare la vie du joueur

    const takeDamage = (amount) => {
        setHealth((prev) => Math.max(prev - amount, 0)); // 🔹 Réduit la vie, minimum 0
    };

    return (
        <div style={{ position: 'absolute', top: 20, left: 20 }}>
            <div style={{
                width: '200px',
                height: '20px',
                background: '#333',
                borderRadius: '5px',
                border: '2px solid black'
            }}>
                <div style={{
                    width: `${health}%`,
                    height: '100%',
                    background: health > 50 ? 'green' : health > 20 ? 'orange' : 'red',
                    transition: 'width 0.3s ease'
                }} />
            </div>
            <button onClick={() => takeDamage(10)}>Prendre des dégâts</button>
        </div>
    );
}
