# Custom Stream Overlay Widget

A versatile and highly customizable overlay widget for streaming platforms. This widget provides animated alerts for follows, subscriptions, tips, cheers, and raids, along with rotating social media and sponsor displays.

![Widget Preview](widget_preview.gif)

## Features

- **Multiple Alert Types**:

  - Follows (with customized "Dzięki za follow" message)
  - Subscriptions (new subs, resubs, gift subs, community gifts)
  - Tips (with currency display format)
  - Cheers
  - Raids

- **Alert Customization**:

  - Custom GIFs for each alert type
  - Custom sound effects
  - Duration control
  - Animated transitions

- **Social Media Rotator**:

  - Display your social media profiles on rotation
  - Customizable commands for viewers

- **Sponsor Rotator**:

  - Showcase your sponsors with custom images
  - Configurable rotation intervals

- **Event Display**:

  - Show recent events like latest subscriber
  - Automatic rotation between events

- **Visual Customization**:
  - Custom positioning (top-left, top-right, bottom-left, bottom-right, center)
  - Custom colors for each element
  - Adjustable sizes and layouts
  - Custom CSS support

## Installation

1. Visit your streaming platform's custom widget section (StreamElements)
2. Create a new custom widget
3. Copy the HTML, CSS, and JS files from this repository into the respective editors
4. Configure the widget settings to your preference
5. Save and add to your scenes

## Configuration

The widget offers numerous configuration options:

### General Settings

- Logo image
- Widget position
- Logo width
- Background colors
- Text colors

### Alert Settings

- Enable/disable specific alert types
- Alert duration
- Alert sound volume

### Alert Media

- Custom GIFs for each alert type (as JSON arrays of URLs)
- Custom sound effects for each alert type

### Rotation Settings

- Enable/disable rotations
- Social media rotation interval
- Sponsor rotation interval
- Event rotation interval

## How Tips & Follows Display

- **Tips**: Display in format "30 PLN {{currency}}" instead of "x30"
- **Follows**: Display "Dzięki za follow" instead of amount

## Custom CSS

You can add your own CSS styles in the widget settings to further customize the appearance:

```css
/* Example custom styles */
.badge {
  border-radius: 10px !important;
}

.name {
  font-family: "Montserrat", sans-serif !important;
}
```

## Adding Social Media

You can add up to 5 social media platforms:

1. Enable the social media rotator
2. Fill in the platform name (e.g., "Twitter", "Instagram")
3. Add the command to display (e.g., "!twitter", "!insta")

## Adding Sponsors

You can add up to 5 sponsors:

1. Enable the sponsor rotator
2. Fill in the sponsor name
3. Add the sponsor image URL

## Troubleshooting

- If alerts are not showing, check that the alert type is enabled in settings
- For custom GIFs, make sure the JSON array is properly formatted
- Ensure your sound files are accessible and not blocked

## Author

This overlay widget was created by Webbyj.io. For more projects or to contact the author:

- GitHub: [twój_github]
- WEbsite: [webbyj.io]

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue if you have suggestions for improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
