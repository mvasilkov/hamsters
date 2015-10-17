htdocs:
	./make_pre.js
	./make_combo.js
	./make_css.js
	./make_html.js
	cp template/app.css htdocs
	mv ~/Hamsters/pre/hamsters_*.png htdocs
	touch htdocs

clean:
	rm -rf htdocs

.PHONY: clean
