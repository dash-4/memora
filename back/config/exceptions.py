from rest_framework.views import exception_handler
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        detail = response.data.get('detail', response.data) if isinstance(response.data, dict) else response.data
        if isinstance(detail, list):
            detail = detail[0] if detail else 'Error'
        return Response({'error': True, 'detail': detail}, status=response.status_code)
    return response
