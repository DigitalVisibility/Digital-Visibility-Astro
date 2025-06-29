const fs = require('fs');
const path = require('path');

// Enhanced validation with multiple checks
function validateSchemaMarkup() {
    const distPath = path.join(__dirname, 'dist');
    
    if (!fs.existsSync(distPath)) {
        console.log('❌ Build directory not found. Run "npm run build" first.');
        return;
    }

    console.log('🔍 Schema Markup Validation Report\n');
    console.log('=' .repeat(60));
    
    const results = {
        totalPages: 0,
        pagesWithSchema: 0,
        validSchemas: 0,
        invalidSchemas: 0,
        errors: [],
        warnings: [],
        schemaTypes: new Set()
    };

    // Scan all HTML files
    scanDirectory(distPath, results);
    
    // Generate report
    generateReport(results);
    
    // Provide validation tool recommendations
    console.log('\n📋 RECOMMENDED VALIDATION TOOLS:');
    console.log('=' .repeat(60));
    console.log('1. Google Rich Results Test: https://search.google.com/test/rich-results');
    console.log('2. Schema Markup Validator: https://validator.schema.org/');
    console.log('3. Google Search Console: Monitor live schema performance');
    console.log('\n💡 VALIDATION STEPS:');
    console.log('1. Copy individual page URLs to Rich Results Test');
    console.log('2. Test key pages: homepage, contact, services, blog');
    console.log('3. Check for rich result eligibility');
    console.log('4. Validate JSON-LD syntax and schema compliance');
}

function scanDirectory(dir, results) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            scanDirectory(filePath, results);
        } else if (file.endsWith('.html')) {
            analyzeHTMLFile(filePath, results);
        }
    });
}

function analyzeHTMLFile(filePath, results) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(path.join(__dirname, 'dist'), filePath);
    
    results.totalPages++;
    
    // Find all JSON-LD script tags
    const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const matches = [...content.matchAll(jsonLdRegex)];
    
    if (matches.length === 0) {
        console.log(`⚠️  ${relativePath} - No schema markup found`);
        return;
    }
    
    results.pagesWithSchema++;
    console.log(`\n📄 ${relativePath}`);
    console.log('-'.repeat(40));
    
    matches.forEach((match, index) => {
        const jsonContent = match[1].trim();
        
        try {
            // Parse JSON-LD
            const schema = JSON.parse(jsonContent);
            results.validSchemas++;
            
            // Analyze schema structure
            analyzeSchema(schema, relativePath, results);
            
            console.log(`✅ Schema ${index + 1}: Valid JSON-LD`);
            
        } catch (error) {
            results.invalidSchemas++;
            results.errors.push({
                file: relativePath,
                error: `Schema ${index + 1}: ${error.message}`,
                content: jsonContent.substring(0, 100) + '...'
            });
            console.log(`❌ Schema ${index + 1}: Invalid JSON - ${error.message}`);
        }
    });
}

function analyzeSchema(schema, filePath, results) {
    // Handle arrays of schemas
    const schemas = Array.isArray(schema) ? schema : [schema];
    
    schemas.forEach(s => {
        if (s['@type']) {
            const schemaType = Array.isArray(s['@type']) ? s['@type'].join(', ') : s['@type'];
            results.schemaTypes.add(schemaType);
            console.log(`   📋 Type: ${schemaType}`);
            
            // Check for common required properties
            validateRequiredProperties(s, schemaType, filePath, results);
        }
        
        // Check for nested schemas
        Object.values(s).forEach(value => {
            if (typeof value === 'object' && value !== null && value['@type']) {
                analyzeSchema(value, filePath, results);
            }
        });
    });
}

function validateRequiredProperties(schema, schemaType, filePath, results) {
    const requiredFields = {
        'Organization': ['name', 'url'],
        'LocalBusiness': ['name', 'address'],
        'Person': ['name'],
        'Article': ['headline', 'author', 'datePublished'],
        'WebSite': ['name', 'url'],
        'Service': ['name', 'description'],
        'FAQPage': ['mainEntity'],
        'WebApplication': ['name', 'applicationCategory'],
        'Offer': ['price', 'priceCurrency']
    };
    
    const required = requiredFields[schemaType];
    if (required) {
        required.forEach(field => {
            if (!schema[field]) {
                results.warnings.push({
                    file: filePath,
                    warning: `${schemaType} missing recommended field: ${field}`
                });
                console.log(`   ⚠️  Missing recommended: ${field}`);
            }
        });
    }
    
    // Check for common issues
    checkCommonIssues(schema, schemaType, filePath, results);
}

function checkCommonIssues(schema, schemaType, filePath, results) {
    // Check for template literals that weren't processed
    const jsonString = JSON.stringify(schema);
    if (jsonString.includes('${') || jsonString.includes('undefined')) {
        results.errors.push({
            file: filePath,
            error: `${schemaType} contains unprocessed template literals or undefined values`
        });
        console.log(`   ❌ Contains template literals or undefined values`);
    }
    
    // Check for proper URL format
    ['url', 'sameAs', 'logo', 'image'].forEach(field => {
        if (schema[field] && typeof schema[field] === 'string') {
            if (!schema[field].startsWith('http://') && !schema[field].startsWith('https://')) {
                results.warnings.push({
                    file: filePath,
                    warning: `${schemaType}.${field} should be a complete URL`
                });
                console.log(`   ⚠️  ${field} should be complete URL`);
            }
        }
    });
    
    // Check coordinates format
    if (schema.geo && schema.geo.latitude) {
        if (typeof schema.geo.latitude !== 'number') {
            results.warnings.push({
                file: filePath,
                warning: `${schemaType} geo coordinates should be numbers, not strings`
            });
        }
    }
}

function generateReport(results) {
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total pages scanned: ${results.totalPages}`);
    console.log(`Pages with schema: ${results.pagesWithSchema}`);
    console.log(`Valid schemas: ${results.validSchemas}`);
    console.log(`Invalid schemas: ${results.invalidSchemas}`);
    console.log(`Schema coverage: ${((results.pagesWithSchema / results.totalPages) * 100).toFixed(1)}%`);
    
    console.log('\n📋 SCHEMA TYPES FOUND:');
    console.log('=' .repeat(60));
    [...results.schemaTypes].sort().forEach(type => {
        console.log(`• ${type}`);
    });
    
    if (results.errors.length > 0) {
        console.log('\n❌ CRITICAL ERRORS:');
        console.log('=' .repeat(60));
        results.errors.forEach(error => {
            console.log(`${error.file}: ${error.error}`);
        });
    }
    
    if (results.warnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        console.log('=' .repeat(60));
        results.warnings.forEach(warning => {
            console.log(`${warning.file}: ${warning.warning}`);
        });
    }
    
    // Overall status
    console.log('\n🎯 OVERALL STATUS:');
    console.log('=' .repeat(60));
    if (results.invalidSchemas === 0 && results.errors.length === 0) {
        console.log('✅ All schemas are syntactically valid!');
        console.log('✅ Ready for Google Rich Results testing');
    } else {
        console.log('❌ Some schemas need attention before testing');
    }
}

// Test URLs for manual validation
function generateTestUrls() {
    console.log('\n🔗 KEY PAGES TO TEST MANUALLY:');
    console.log('=' .repeat(60));
    console.log('Copy these URLs to Google Rich Results Test:');
    console.log('https://search.google.com/test/rich-results\n');
    
    const keyPages = [
        'https://digitalvisibility.co.uk/',
        'https://digitalvisibility.co.uk/contact/',
        'https://digitalvisibility.co.uk/about/',
        'https://digitalvisibility.co.uk/services/ai-conversation-automation/',
        'https://digitalvisibility.co.uk/pricing/',
        'https://digitalvisibility.co.uk/faq/',
        'https://digitalvisibility.co.uk/blog/'
    ];
    
    keyPages.forEach((url, index) => {
        console.log(`${index + 1}. ${url}`);
    });
}

// Run validation
validateSchemaMarkup();
generateTestUrls(); 