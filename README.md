# morrisonkuhlsen.com

![morrisonkuhlsen logo](https://raw.githubusercontent.com/morrisonkulsenn/public/refs/heads/main/mk-logo-300x.png)

A blog dedicated to the study and application of **Statistics and Probability**, available at [morrisonkuhlsen.com](https://morrisonkuhlsen.com).

The goal is to make technical concepts more accessible through clear content, practical examples, and interactive tools. Posts are published in both Portuguese and English.

The site is built with [Jekyll](https://jekyllrb.com/) and [Bootstrap Italia](https://github.com/italia/bootstrap-italia/).

## Running locally

Install dependencies:

```bash
bundle install
```

Start the development server:

```bash
bundle exec jekyll serve --config _config.yml,_config_dev.yml
```

The site will be available at `http://localhost:4000`.

> **Config files:**
> - `_config.yml` — production settings
> - `_config_dev.yml` — local development settings (overrides baseurl and environment)

## License

This repository is licensed under the BSD-3-Clause license. See the [LICENSE](LICENSE) file for details.
