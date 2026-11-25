// Append window bindings to all core classes
const fs = require('fs');

const mappings = [
    { file: 'js/config.js', exportName: 'CONFIG' },
    { file: 'js/particles.js', exportName: 'ParticleSystem' },
    { file: 'js/physics.js', exportName: 'PhysicsEngine' },
    { file: 'js/shop.js', exportName: 'ShopSystem' },
    { file: 'js/renderer.js', exportName: 'Renderer' }
];

mappings.forEach(m => {
    const p = '/home/ubuntu/ascii-platformer/' + m.file;
    let content = fs.readFileSync(p, 'utf8');
    if (!content.includes('window.' + m.exportName)) {
        content += `\nif (typeof window !== 'undefined') window.${m.exportName} = ${m.exportName};\n`;
        fs.writeFileSync(p, content);
        console.log("Attached to window in", m.file, m.exportName);
    }
});
