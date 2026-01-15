FROM node:20-alpine

# Install required packages
RUN apk add --no-cache curl tar xz

# Download FFmpeg from GitHub Releases (CDN) and extract into a stable folder
RUN curl -L --retry 10 --retry-delay 2 \
    -o /tmp/ffmpeg.tar.xz \
    https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz \
  && mkdir -p /tmp/ffmpeg \
  && tar -xf /tmp/ffmpeg.tar.xz -C /tmp/ffmpeg --strip-components=1 \
  && cp /tmp/ffmpeg/bin/ffmpeg /usr/local/bin/ffmpeg \
  && cp /tmp/ffmpeg/bin/ffprobe /usr/local/bin/ffprobe \
  && chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe \
  && rm -rf /tmp/ffmpeg /tmp/ffmpeg.tar.xz

COPY package*.json ./
RUN npm install --production

COPY dist/ ./dist/
COPY lambda.js .

# Expose the port that our HTTP server will listen on
EXPOSE 8080

# Use node to run our lambda wrapper
CMD ["node", "lambda.js"]
