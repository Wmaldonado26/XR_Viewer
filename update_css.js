const fs = require('fs');
let css = fs.readFileSync('src/components/features/projects/ProjectEditor.css', 'utf8');

// 1. stat-card-modern improvements
css = css.replace('.stat-card-modern {\n  background: #ffffff;\n  border: 1px solid #e2e8f0;\n  border-radius: 12px;\n  padding: 1.5rem;\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  align-items: center;\n  box-shadow: 0 1px 3px rgba(0,0,0,0.05);\n  transition: transform 0.2s ease, border-color 0.2s ease;\n}',
`.stat-card-modern {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}`);

css = css.replace('.stat-card-modern:hover {\n  transform: translateY(-2px);\n  border-color: #cbd5e1;\n  box-shadow: 0 4px 6px rgba(0,0,0,0.05);\n}',
`.stat-card-modern:hover {
  transform: translateY(-4px);
  border-color: #e2e8f0;
  box-shadow: 0 20px 25px -5px rgba(0, 51, 160, 0.05), 0 10px 10px -5px rgba(0, 51, 160, 0.02);
}`);

// 2. premium-card improvements
css = css.replace('.premium-card {\n  background: #ffffff;\n  border: 1px solid #e2e8f0;\n  border-radius: 12px;\n  overflow: hidden;\n  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);\n}',
`.premium-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -2px rgba(0, 0, 0, 0.01);
  transition: box-shadow 0.3s ease;
}`);

css = css.replace('.premium-card-header {\n  padding: 1.5rem;\n  border-bottom: 1px solid #e2e8f0;\n  background: #f8fafc;\n}',
`.premium-card-header {
  padding: 1.75rem 2rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  background: #ffffff;
}`);

css = css.replace('.premium-card-body {\n  padding: 1.5rem;\n}',
`.premium-card-body {
  padding: 2rem;
}`);

// 3. asset-card & doc-card improvements
css = css.replace('.asset-card {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}',
`.asset-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  transition: all 0.3s ease;
}
.asset-card:hover {
  box-shadow: 0 10px 20px -5px rgba(0, 51, 160, 0.08);
  border-color: #e2e8f0;
  transform: translateY(-2px);
}`);

css = css.replace('.asset-body {\n  flex: 1;\n  padding: 1rem;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 200px;\n  background: #f1f5f9;\n}',
`.asset-body {
  flex: 1;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f8fafc;
}`);

css = css.replace('.btn-asset-remove {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  background: rgba(220, 38, 38, 0.9);\n  color: white;\n  border: none;\n  border-radius: 6px;\n  padding: 0.4rem;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  opacity: 0;\n}',
`.btn-asset-remove {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(239, 68, 68, 0.1);
  backdrop-filter: blur(4px);
  color: #ef4444;
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  transform: scale(0.9);
}`);

css = css.replace('.asset-preview:hover .btn-asset-remove,\n.gallery-item-modern:hover .btn-asset-remove {\n  opacity: 1;\n}',
`.asset-preview:hover .btn-asset-remove,
.gallery-item-modern:hover .btn-asset-remove {
  opacity: 1;
  transform: scale(1);
}
.btn-asset-remove:hover {
  background: #ef4444;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.25);
}`);

// 4. doc-item-modern
css = css.replace('.doc-item-modern {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  background: #ffffff;\n  border: 1px solid #e2e8f0;\n  padding: 0.75rem;\n  border-radius: 8px;\n  width: 100%;\n}',
`.doc-item-modern {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  border-radius: 12px;
  width: 100%;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.01);
}
.doc-item-modern:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px -2px rgba(0, 51, 160, 0.05);
  transform: translateX(4px);
}`);

// 5. Inputs / Selects
css = css.replace('.form-group-modern input,\n.form-group-modern select,\n.form-group-modern textarea {\n  background: #ffffff;\n  border: 1px solid #cbd5e1;\n  border-radius: 8px;\n  padding: 0.75rem 1rem;\n  color: #0f172a;\n  font-family: inherit;\n  font-size: 0.95rem;\n  transition: all 0.2s ease;\n}',
`.form-group-modern input,
.form-group-modern select,
.form-group-modern textarea,
.scene-filter-select,
.doc-input,
.scene-card-content input {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.85rem 1.15rem;
  color: #0f172a;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.01);
}`);

css = css.replace('.form-group-modern input:focus,\n.form-group-modern select:focus,\n.form-group-modern textarea:focus {\n  outline: none;\n  border-color: #0033a0;\n  box-shadow: 0 0 0 3px rgba(0, 51, 160, 0.1);\n}',
`.form-group-modern input:focus,
.form-group-modern select:focus,
.form-group-modern textarea:focus,
.scene-filter-select:focus,
.doc-input:focus,
.scene-card-content input:focus {
  outline: none;
  background: #ffffff;
  border-color: #0033a0;
  box-shadow: 0 0 0 4px rgba(0, 51, 160, 0.1), inset 0 1px 2px rgba(0,0,0,0.02);
}`);


// 6. scene-card-modern 
css = css.replace('.scene-card-modern {\n  background: #ffffff;\n  border: 1px solid #e2e8f0;\n  border-radius: 12px;\n  overflow: hidden;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);\n  transition: all 0.3s ease;\n  display: flex;\n  flex-direction: column;\n}',
`.scene-card-modern {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}`);

css = css.replace('.scene-card-modern:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);\n  border-color: #cbd5e1;\n}',
`.scene-card-modern:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 25px -5px rgba(0, 51, 160, 0.08), 0 10px 10px -5px rgba(0, 51, 160, 0.04);
  border-color: #0033a0;
}`);

css = css.replace('.scene-badge-360 {\n  position: absolute;\n  top: 12px;\n  left: 12px;\n  background: rgba(15, 23, 42, 0.7);\n  backdrop-filter: blur(4px);\n  color: white;\n  padding: 0.25rem 0.5rem;\n  border-radius: 4px;\n  font-size: 0.7rem;\n  font-weight: 700;\n  letter-spacing: 1px;\n  z-index: 2;\n}',
`.scene-badge-360 {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  color: #0033a0;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;
  z-index: 2;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 4px;
}`);

css = css.replace('.scene-card-footer {\n  padding: 1rem;\n  background: #f8fafc;\n  border-top: 1px solid #e2e8f0;\n  display: flex;\n  gap: 0.5rem;\n}',
`.scene-card-footer {
  padding: 1.25rem;
  background: #ffffff;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  display: flex;
  gap: 0.75rem;
}`);

// 7. hotspot-card-modern
css = css.replace('.hotspot-card-modern {\n  background: #ffffff;\n  border: 1px solid #e2e8f0;\n  border-radius: 12px;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);\n  transition: all 0.3s ease;\n}',
`.hotspot-card-modern {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}`);

css = css.replace('.hotspot-card-modern:hover {\n  transform: translateY(-2px);\n  border-color: #cbd5e1;\n}',
`.hotspot-card-modern:hover {
  transform: translateY(-4px);
  border-color: #94a3b8;
  box-shadow: 0 12px 20px -5px rgba(0, 51, 160, 0.08);
}`);

css = css.replace('.hotspot-card-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem 1.25rem;\n  border-bottom: 1px solid #e2e8f0;\n  background: #f8fafc;\n}',
`.hotspot-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  background: #ffffff;
  border-radius: 16px 16px 0 0;
}`);

css = css.replace('.hotspot-type-badge {\n  background: #dbeafe;\n  color: #1e3a8a;\n  padding: 0.25rem 0.75rem;\n  border-radius: 999px;\n  font-size: 0.75rem;\n  font-weight: 700;\n  text-transform: uppercase;\n}',
`.hotspot-type-badge {
  background: rgba(0, 51, 160, 0.08);
  color: #0033a0;
  padding: 0.35rem 0.85rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}`);

fs.writeFileSync('src/components/features/projects/ProjectEditor.css', css);
console.log('ProjectEditor.css updated with modern UI/UX enhancements');
