# X-Wing Card Images Data

A collection of card images from [X-Wing: The Miniatures Game](https://www.fantasyflightgames.com/en/products/x-wing/) by [Fantasy Flight Games](http://fantasyflightgames.com/), arranged and named to be compatible with the [XWS format](https://github.com/elistevens/xws-spec).

## What's included

There are two top-level directories: `images` and `util`.

### images

The `images` folder contains images for each card. Pilot cards are divided by faction (imperial, rebels, scum) then ship type. Upgrades are divided by upgrade type.

Cards are named according to the [XWS specification](https://github.com/elistevens/xws-spec) that provides rules for naming X-Wing Miniatures Game cards in an application-neutral manner.

### util

The `util` folder holds scripts and utilities to help manage the cards and repo.

## Usage

You can use this data to build your own apps, squad builders, web sites, etc.

The easiest way to do this is to include the repo via [Bower](http://bower.io/) or as a [Git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules#Starting-with-Submodules).

## Bugs / Issues

Please [open a ticket](https://github.com/voidstate/xwing-card-images/issues) on Github.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :tada:

When adding images:
* Pilot cards should be resized to **300 x 418** pixels. Upgrade cards should be **194 x 300** pixels.
* Please use [TinyPNG](https://tinypng.com/) to reduce their filesize as much as possible without affecting image quality.

## Projects

A list of projects that use this content:

- [Unofficial X-Wing Squadron Builder](http://xwing-builder.co.uk)

Want your project listed here? [Let us know!](https://github.com/voidstate/xwing-card-images/issues/new?title=Add%20Project)

## Versioning

This project uses [SemVer](http://semver.org/). Given a `MAJOR.MINOR.PATCH` version number, we will increment the:
- `MAJOR` version when existing content is changed in such a way that it can break consumers of the data. *Used if the XWS format changes in a breaking manner*
- `MINOR` version when new content is added in a backwards-compatible manner, or existing content is changed in a backwards-compatible manner. *Used for adding new cards.*
- `PATCH` version when fixing mistakes in existing content. *Used for replacing cards with better quality versions of the image.*

## History

See the [Releases tab](https://github.com/voidstate/xwing-card-images/releases) in Github.

## Contributors

- Voidstate (https://github.com/voidstate)
- Andrew Matheny (https://github.com/ajmath)

Initially forked from [guidokessels/xwing-data](https://github.com/guidokessels/xwing-data).

## License
[MIT](http://guidokessels.mit-license.org/)

---

Star Wars, X-Wing: The Miniatures Game and all related properties, images and text are owned by Fantasy Flight Games, Lucasfilm Ltd., and/or Disney.

