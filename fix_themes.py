import os
import re

themes_dir = r"c:\Users\Silva\WorkSpace\windows assistant\real-everything-app\desktop-app\Themes"

converter_lines = """    <!-- Converters needed for data binding -->
    <converters:ConnectorStatusColorConverter x:Key="ConnectorStatusColorConverter"/>
    <converters:StatusColorConverter x:Key="StatusColorConverter"/>
    <converters:RiskColorConverter x:Key="RiskColorConverter"/>
    <converters:UrlToVisibilityConverter x:Key="UrlToVisibilityConverter"/>
    <converters:NotConnectedVisibilityConverter x:Key="NotConnectedVisibilityConverter"/>"""

files_to_fix = [
    "CrimsonTheme.xaml", "EmeraldTheme.xaml", "MidnightTheme.xaml", "NeonTheme.xaml",
    "SlateTheme.xaml", "MinimalDarkTheme.xaml", "MinimalLightTheme.xaml",
    "HighContrastTheme.xaml", "SolarizedTheme.xaml"
]

for filename in files_to_fix:
    filepath = os.path.join(themes_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip if already has converters
    if 'converters:' in content:
        print(f"Skipping {filename} - already has converters")
        continue

    # Add xmlns:converters to opening tag
    content = content.replace(
        'xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">',
        'xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"\n                    xmlns:converters="clr-namespace:RealEverything.Converters">'
    )

    # Add converters before closing tag
    content = content.replace(
        '</ResourceDictionary>',
        converter_lines + '\n</ResourceDictionary>'
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {filename}")

print("All theme files updated!")
