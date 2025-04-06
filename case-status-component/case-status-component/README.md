# Case Status Component

A standalone React component for checking case status with CAPTCHA verification.

## Features

- CNR number input
- CAPTCHA verification
- Multi-language support (English and Hindi)
- Responsive design
- Loading states and error handling
- Toast notifications
- Animated transitions

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Usage

1. Update the API URL in `src/main.jsx`:

```jsx
<CaseStatus apiUrl="http://your-api-url" />
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## API Requirements

The component expects the following API endpoints:

1. GET `/` - Returns CAPTCHA image in base64 format

```json
{
  "captcha_base64": "base64_encoded_image"
}
```

2. POST `/submit` - Submits case status request

```json
// Request
{
  "cino": "case_number",
  "captcha": "captcha_text"
}

// Response
{
  "success": true,
  "result": "case_status_details"
}
```

## Customization

### Styling

The component uses Tailwind CSS for styling. You can customize the appearance by:

1. Modifying the Tailwind configuration in `tailwind.config.js`
2. Updating the CSS variables in `src/index.css`
3. Modifying the component styles in `src/components/CaseStatus.jsx`

### Internationalization

The component supports multiple languages through i18next. To add a new language:

1. Add translations to the resources object in `src/i18n.js`
2. Set the language using i18next's `changeLanguage` method

## Dependencies

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Axios
- i18next
- Sonner (for toast notifications)
- Lucide React (for icons)

## License

MIT
