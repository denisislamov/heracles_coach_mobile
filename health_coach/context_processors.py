from health_coach import VERSION


def version(request):
    return {'APP_VERSION': VERSION}

