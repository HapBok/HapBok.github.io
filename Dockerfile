FROM ruby:3.3-slim
RUN apt-get update && apt-get install -y --no-install-recommends build-essential git ca-certificates libssl-dev && rm -rf /var/lib/apt/lists/*
WORKDIR /site
COPY Gemfile Gemfile.lock ./
RUN bundle install
EXPOSE 4000
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--port", "4000", "--force_polling"]
