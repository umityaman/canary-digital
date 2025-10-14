import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

const templatesDir = path.join(__dirname, '../templates/emails');

/**
 * Compile a Handlebars template with provided data
 */
export const compileTemplate = (templateName: string, data: any): string => {
  try {
    const templatePath = path.join(templatesDir, `${templateName}.hbs`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}.hbs`);
    }
    
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    
    return template(data);
  } catch (error) {
    console.error(`Error compiling template ${templateName}:`, error);
    throw error;
  }
};

/**
 * Register custom Handlebars helpers
 */
Handlebars.registerHelper('formatCurrency', function(amount: number) {
  return new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY' 
  }).format(amount);
});

Handlebars.registerHelper('formatDate', function(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleDateString('tr-TR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

Handlebars.registerHelper('formatDateTime', function(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleString('tr-TR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});
