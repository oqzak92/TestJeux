import React, { useState } from 'react';

export function PlayerHealth({ health, setHealth }) {
    const takeDamage = (amount) => {
        setHealth((prev) => Math.max(prev - amount, 0)); // Réduit la vie, minimum 0
    };

    return (
        <div style={{ position: 'absolute', top: 20, left: 20 }}>
            <div style={{
                width: '200px',
                height: '20px',
                background: '#333',
                borderRadius: '5px',
                border: '2px solid black',
                position: 'relative'
            }}>
                <div
                    style={{
                        width: `${health}%`, // Définir la largeur de la barre en fonction de la vie
                        height: '100%',
                        background: health > 50 ? 'green' : health > 20 ? 'orange' : 'red',
                        transition: 'width 0.3s ease'
                    }}
                />
                {/* Affichage du nombre à l'intérieur de la barre de vie */}
                <span
                    style={{
                        position: 'absolute',
                        top: '0',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'white',
                        fontWeight: 'bold'
                    }}
                >
                    {health}%
                </span>
            </div>
            <button onClick={() => takeDamage(10)}>Prendre des dégâts</button>
        </div>
    );
}
