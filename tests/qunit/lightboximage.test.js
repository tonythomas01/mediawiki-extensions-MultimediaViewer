( function ( /** mw, $ ** Commentted to keep lint happy, uncomment when needed */) {
	QUnit.module( 'multilightbox.image', QUnit.newMwEnvironment() );

	QUnit.asyncTest( 'Sanity test, object creation and image loading', 1, function ( assert ) {
		var lightboxImage = new window.LightboxImage( 'http://en.wikipedia.org/w/skins/vector/images/search-ltr.png' );

		// Function to be called if loading is successful
		function loadCallback() {
			assert.ok( true, 'Image loaded !' );
			QUnit.start();
		}

		lightboxImage.getImageElement( loadCallback );
	} );

}( mediaWiki, jQuery ) );
