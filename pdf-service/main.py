from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML
import io
import os
import re
from datetime import datetime