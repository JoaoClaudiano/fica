const fs = require('fs');
const path = require('path');

// 1. Corrigir caminhos em components.js
const componentsPath = path.join(__dirname, 'public/scripts/components.js');
let componentsContent = fs.readFileSync(componentsPath, 'utf8');

componentsContent = componentsContent.replace(
  /fetch\('\/fica\/public\/components\/([^']+)'\)/g,
  "fetch('../components/$1')"
);

fs.writeFileSync(componentsPath, componentsContent);
console.log('✓ Caminhos corrigidos em components.js');

// 2. Adicionar tratamento de erro básico
const filesToUpdate = [
  'public/scripts/app.js',
  'public/scripts/auth.js',
  'public/scripts/risk.js'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Adicionar try-catch básico em funções async
  content = content.replace(
    /(async\s+function\s+\w+\([^)]*\)\s*{)/g,
    '$1\n  try {'
  );
  
  content = content.replace(
    /(}\s*\)\s*;\s*$)/gm,
    '  } catch (error) {\n    console.error(\'Erro:\', error);\n    throw error;\n  }\n$1'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✓ Tratamento de erro adicionado em ${file}`);
});

console.log('\n🎉 Migração básica concluída!');