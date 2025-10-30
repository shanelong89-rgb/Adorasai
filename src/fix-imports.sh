#!/bin/bash

# Fix all versioned imports in the codebase
# This script removes @version syntax from all imports

echo "🔧 Fixing versioned imports..."

# Fix sonner imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/from "sonner@[^"]*"/from "sonner"/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak "s/from 'sonner@[^']*'/from 'sonner'/g" {} \;

# Fix lucide-react imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/from "lucide-react@[^"]*"/from "lucide-react"/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak "s/from 'lucide-react@[^']*'/from 'lucide-react'/g" {} \;

# Fix @radix-ui imports
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/@radix-ui\/[^@"]*@[^"]*"/@radix-ui\/\1"/g' {} \;

# Fix class-variance-authority
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/from "class-variance-authority@[^"]*"/from "class-variance-authority"/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak "s/from 'class-variance-authority@[^']*'/from 'class-variance-authority'/g" {} \;

# Fix other common packages
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/from "cmdk@[^"]*"/from "cmdk"/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/from "vaul@[^"]*"/from "vaul"/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/from "recharts@[^"]*"/from "recharts"/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/from "embla-carousel-react@[^"]*"/from "embla-carousel-react"/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/from "input-otp@[^"]*"/from "input-otp"/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/from "react-resizable-panels@[^"]*"/from "react-resizable-panels"/g' {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak 's/from "next-themes@[^"]*"/from "next-themes"/g' {} \;

# Remove backup files
find . -name "*.bak" -delete

echo "✅ All versioned imports fixed!"
echo "📝 Please review the changes before committing"
