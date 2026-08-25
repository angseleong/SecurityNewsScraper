_SOFTWARE_KWS = {
    "windows", "linux", "macos", "android", "ios",
    "apache", "nginx", "cisco", "fortinet", "chrome", "firefox", "oracle"
}

def extract_affected_software(text: str) -> list[str]:
    text_lower = text.lower()
    found = {sw for sw in _SOFTWARE_KWS if sw in text_lower}
    return list(found)
