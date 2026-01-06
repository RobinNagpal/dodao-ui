FROM public.ecr.aws/lambda/nodejs:20

# curl is already present as curl-minimal on this base image
RUN dnf install -y tar xz && dnf clean all

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
CMD ["dist/index.handler"]
