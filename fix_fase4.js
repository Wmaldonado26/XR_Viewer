const fs = require('fs');

const files = [
  'src/components/features/hotspots/HotspotModal.css',
  'src/components/features/hotspots/CustomHotspot.css',
  'src/components/features/hotspots/HotspotVisualEditor.css',
  'src/components/features/maps/MiniMapWidget.jsx',
  'src/components/features/maps/NavigationHistory.css',
  'src/components/features/maps/TopMapOverlay.css'
];

files.forEach(file => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/#3b82f6/g, '#0033a0');
    content = content.replace(/#2563eb/g, '#002277');
    content = content.replace(/#1d4ed8/g, '#002277');
    content = content.replace(/#1e293b/g, '#0f172a');
    content = content.replace(/#475569/g, '#334155');
    
    // specifically handle quoted strings in MiniMapWidget
    content = content.replace(/'#3b82f6'/g, "'#0033a0'");
    content = content.replace(/'#2563eb'/g, "'#002277'");
    
    fs.writeFileSync(file, content);
  } catch (e) {
    console.log('Skipping ' + file);
  }
});
console.log('Fixed Fase 4 themes');
