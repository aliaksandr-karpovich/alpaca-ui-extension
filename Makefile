VERSION  := $(shell sed -n 's/.*"version": "\([^"]*\)".*/\1/p' manifest.json)
BUILD_DIR := build
PKG      := $(BUILD_DIR)/alpaca-extension-$(VERSION).zip
FILES    := manifest.json content.js popup.html popup.js dark-mode.css icon-128.png LICENSE PRIVACY.md readme.md

.PHONY: package clean

package:
	mkdir -p $(BUILD_DIR)
	rm -f $(PKG)
	zip -r $(PKG) $(FILES)

clean:
	rm -rf $(BUILD_DIR)