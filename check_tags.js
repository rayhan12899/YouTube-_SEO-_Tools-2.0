
import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

const stack = [];
const tags = [];

const voidTags = ['img', 'br', 'hr', 'input', 'link', 'meta'];

const regex = /<(\/?)([a-zA-Z0-9.]+)([^>]*?)(\/?)>/g;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let match;
  while ((match = regex.exec(line)) !== null) {
    const [full, isClosing, tagName, attrs, isSelfClosing] = match;
    
    if (isSelfClosing || voidTags.includes(tagName) || attrs.endsWith('/')) {
      continue;
    }

    if (isClosing) {
      if (stack.length === 0) {
        console.log(`Extra closing tag </${tagName}> at line ${i + 1}`);
      } else {
        const last = stack.pop();
        if (last.tagName !== tagName) {
          console.log(`Mismatched tag: opened <${last.tagName}> at line ${last.line}, closed </${tagName}> at line ${i + 1}`);
        }
      }
    } else {
      stack.push({ tagName, line: i + 1 });
    }
  }
}

stack.forEach(tag => {
  console.log(`Unclosed tag <${tag.tagName}> opened at line ${tag.line}`);
});
