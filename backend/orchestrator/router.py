
# Placeholder for advanced routing / function calling logic
def route_intent(message: str) -> str:
    """Very naive intent router."""
    if "contact" in message.lower():
        return "hubspot.create_contact"
    return "default"
