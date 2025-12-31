/**
 * Style Mapper
 * Converts CSS classes and Tailwind utilities to inline styles
 */

/**
 * Map Tailwind classes to inline style objects
 */
const tailwindMapping = {
  // Layout
  'grid': { display: 'grid' },
  'flex': { display: 'flex' },
  'block': { display: 'block' },
  'inline-block': { display: 'inline-block' },
  'hidden': { display: 'none' },
  
  // Grid
  'grid-cols-1': { gridTemplateColumns: 'repeat(1, 1fr)' },
  'grid-cols-2': { gridTemplateColumns: 'repeat(2, 1fr)' },
  'grid-cols-3': { gridTemplateColumns: 'repeat(3, 1fr)' },
  'grid-cols-4': { gridTemplateColumns: 'repeat(4, 1fr)' },
  'grid-cols-6': { gridTemplateColumns: 'repeat(6, 1fr)' },
  
  // Gap
  'gap-1': { gap: '0.25rem' },
  'gap-2': { gap: '0.5rem' },
  'gap-3': { gap: '0.75rem' },
  'gap-4': { gap: '1rem' },
  'gap-6': { gap: '1.5rem' },
  'gap-8': { gap: '2rem' },
  
  // Padding
  'p-0': { padding: '0' },
  'p-1': { padding: '0.25rem' },
  'p-2': { padding: '0.5rem' },
  'p-3': { padding: '0.75rem' },
  'p-4': { padding: '1rem' },
  'p-6': { padding: '1.5rem' },
  'p-8': { padding: '2rem' },
  
  'px-2': { paddingLeft: '0.5rem', paddingRight: '0.5rem' },
  'px-4': { paddingLeft: '1rem', paddingRight: '1rem' },
  'px-6': { paddingLeft: '1.5rem', paddingRight: '1.5rem' },
  
  'py-2': { paddingTop: '0.5rem', paddingBottom: '0.5rem' },
  'py-4': { paddingTop: '1rem', paddingBottom: '1rem' },
  'py-6': { paddingTop: '1.5rem', paddingBottom: '1.5rem' },
  
  // Margin
  'm-0': { margin: '0' },
  'm-2': { margin: '0.5rem' },
  'm-4': { margin: '1rem' },
  'm-auto': { margin: 'auto' },
  
  'mx-auto': { marginLeft: 'auto', marginRight: 'auto' },
  'my-4': { marginTop: '1rem', marginBottom: '1rem' },
  
  // Width
  'w-full': { width: '100%' },
  'w-1/2': { width: '50%' },
  'w-1/3': { width: '33.333%' },
  'w-2/3': { width: '66.666%' },
  'w-1/4': { width: '25%' },
  
  // Height
  'h-full': { height: '100%' },
  'h-screen': { height: '100vh' },
  
  // Text
  'text-center': { textAlign: 'center' },
  'text-left': { textAlign: 'left' },
  'text-right': { textAlign: 'right' },
  
  'text-xs': { fontSize: '0.75rem' },
  'text-sm': { fontSize: '0.875rem' },
  'text-base': { fontSize: '1rem' },
  'text-lg': { fontSize: '1.125rem' },
  'text-xl': { fontSize: '1.25rem' },
  'text-2xl': { fontSize: '1.5rem' },
  'text-3xl': { fontSize: '1.875rem' },
  
  'font-normal': { fontWeight: '400' },
  'font-medium': { fontWeight: '500' },
  'font-semibold': { fontWeight: '600' },
  'font-bold': { fontWeight: '700' },
  
  // Colors (basic)
  'text-white': { color: '#ffffff' },
  'text-black': { color: '#000000' },
  'text-gray-500': { color: '#6b7280' },
  'text-gray-700': { color: '#374151' },
  'text-blue-500': { color: '#3b82f6' },
  'text-red-500': { color: '#ef4444' },
  
  'bg-white': { backgroundColor: '#ffffff' },
  'bg-gray-100': { backgroundColor: '#f3f4f6' },
  'bg-gray-200': { backgroundColor: '#e5e7eb' },
  'bg-blue-500': { backgroundColor: '#3b82f6' },
  'bg-red-500': { backgroundColor: '#ef4444' },
  
  // Border
  'border': { border: '1px solid #e5e7eb' },
  'border-2': { border: '2px solid #e5e7eb' },
  'border-gray-300': { borderColor: '#d1d5db' },
  
  'rounded': { borderRadius: '0.25rem' },
  'rounded-md': { borderRadius: '0.375rem' },
  'rounded-lg': { borderRadius: '0.5rem' },
  'rounded-full': { borderRadius: '9999px' },
  
  // Shadows
  'shadow': { boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' },
  'shadow-md': { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  'shadow-lg': { boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  
  // Flex
  'flex-row': { flexDirection: 'row' },
  'flex-col': { flexDirection: 'column' },
  'items-center': { alignItems: 'center' },
  'items-start': { alignItems: 'flex-start' },
  'justify-center': { justifyContent: 'center' },
  'justify-between': { justifyContent: 'space-between' },
};

/**
 * Convert className string to inline style object
 * @param {string} className - Space-separated class names
 * @returns {object} Inline style object
 */
export function classNameToStyle(className) {
  if (!className || typeof className !== 'string') {
    return {};
  }

  const classes = className.split(/\s+/).filter(Boolean);
  const style = {};

  for (const cls of classes) {
    if (tailwindMapping[cls]) {
      Object.assign(style, tailwindMapping[cls]);
    }
  }

  return style;
}

/**
 * Parse CSS string into style object
 * @param {string} cssString - CSS string (e.g., "color: red; font-size: 14px")
 * @returns {object} Style object
 */
export function parseCSSString(cssString) {
  if (!cssString || typeof cssString !== 'string') {
    return {};
  }

  const style = {};
  const declarations = cssString.split(';').filter(Boolean);

  for (const decl of declarations) {
    const [property, value] = decl.split(':').map(s => s.trim());
    if (property && value) {
      // Convert kebab-case to camelCase
      const camelProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      style[camelProperty] = value;
    }
  }

  return style;
}

/**
 * Merge multiple style sources into one object
 * @param  {...object} styles - Style objects to merge
 * @returns {object} Merged style object
 */
export function mergeStyles(...styles) {
  return Object.assign({}, ...styles);
}

/**
 * Convert style object to CSS string
 * @param {object} styleObj - Style object
 * @returns {string} CSS string
 */
export function styleToCSSString(styleObj) {
  if (!styleObj || typeof styleObj !== 'object') {
    return '';
  }

  return Object.entries(styleObj)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}: ${value}`;
    })
    .join('; ');
}

/**
 * Extract Tailwind utilities from className and convert to style
 * @param {object} props - Component props (may contain className)
 * @returns {object} Props with className removed and style added
 */
export function convertClassNameToStyle(props) {
  if (!props || typeof props !== 'object') {
    return props;
  }

  const newProps = { ...props };
  
  if (newProps.className) {
    const convertedStyle = classNameToStyle(newProps.className);
    
    // Merge with existing style if present
    if (newProps.style) {
      if (typeof newProps.style === 'string') {
        const parsedStyle = parseCSSString(newProps.style);
        newProps.style = mergeStyles(convertedStyle, parsedStyle);
      } else {
        newProps.style = mergeStyles(convertedStyle, newProps.style);
      }
    } else {
      newProps.style = convertedStyle;
    }
    
    // Remove className after conversion
    delete newProps.className;
  }

  return newProps;
}

export default {
  classNameToStyle,
  parseCSSString,
  mergeStyles,
  styleToCSSString,
  convertClassNameToStyle
};
