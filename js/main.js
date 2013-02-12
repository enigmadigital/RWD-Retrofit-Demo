$(document).ready(function() {
	// Set up the toggle nav
	nav.setup();
	
	// If rwdRetrofit is loaded
	if (rwdRetrofit) {
		// Use enquire.js to test the media queries
		// Test for the desktop media query
		enquire.register(rwdRetrofit.desktop, {
			// If it matches
			match: function() {
				lightbox.initialise();
			},
			// If it doesn't
			unmatch: function() {
				lightbox.destroy();
			}
		// Add a new test to implement a toggle menu
		}).register('(max-width: 629px)', {
			match: function() {
				nav.initialise();
			}
		// Immediately start testing for the media queries
		}).listen();
	}
	// Otherwise, we don't support media queries, so just initialise the lightbox
	else {
		lightbox.initialise();
	}
	
	tabs.initialise();
	feature.initialise();
});

var $lightboxLinks = $('a.lightbox');
	
var lightbox = {
	initialise: function() {
		// If the number of links to be Colorbox'd is greater than 0
		if ($lightboxLinks.length > 0) {
			Modernizr.load({
				// Load the minified Colorbox script & styles
				load: ['/js/jquery.colorbox.js', '/css/colorbox.css'],
				// When it's loaded, apply Colorbox to the links
				// This will also be triggered if the script has previously been loaded
				complete: function() {
					$lightboxLinks.colorbox();
				}
			});
		}
	},
	destroy: function() {
		if (typeof($.colorbox) != 'undefined') {
			// Remove all traces of ColorBox
			$.colorbox.remove();
			// Remove the click event handlers that ColorBox added
			$lightboxLinks.off('click');
		}
	}
};

// Store some variables to prevent repetition
var aria = 'aria-hidden',
	current = 'current',
	open = 'open';

var $toggle,
	$nav;

// Toggle menu
var nav = {
	setup: function() {
		// Create the toggle link
		$toggle = $('<a href="#nav" id="toggle">Menu</a>');
		$nav = $('#nav');
		
		// Set the nav to be aria-hidden for accessibility; add the toggle link
		$nav.attr(aria, true).before($toggle);
	},
	initialise: function() {
		// On click of the toggle link
		$toggle.on('click', function(e) {
			e.preventDefault();
			var $this = $(this);
			// Toggle a class and aria-hidden to hide/show as approprtiate
			$this.toggleClass(open);
			$this.hasClass(open) ? $nav.attr(aria, false) : $nav.attr(aria, true);
		});
	}
};

// Tabs
var tabs = {
	initialise: function() {
		// Cache the various tab elements
		var $tabs = $('.tabs'),
			$links = $tabs.find('a'),
			$panes = $tabs.next('.panes').find('.pane');
		
		// Set the last tab pane to be accessibly hidden
		$panes.filter(':last').attr(aria, true);
		
		// On click of the tab links
		$links.on('click', function(e) {
			e.preventDefault();
			
			var $this = $(this),
				idx = $this.parent().index();
			
			// If it's not currently the selected tab, remove the current class on the existing tab and set it to this
			if (!$this.hasClass(current)) {
				$links.removeClass(current);
				$this.addClass(current);
			}
			
			// Hide all of the panes
			$panes.hide().attr(aria, true);
			// Show the relevant pane (visually and accessibly)
			$panes.filter(':eq(' + idx + ')').show().attr(aria, false);
		});
	}
};

// Carousel feature
var feature = {
	initialise: function() {
		var $featureParent = $('#feature');
		
		if ($featureParent.length === 1) {
			var $slides = $featureParent.find('li'),
				slidesCount = $slides.length;
			
			// If there is more than one "slide"
			if (slidesCount > 1) {
				// Create previous and next links
				var $navPrev = $('<a href="#previous" class="nav prev" id="nav_prev"><span>Previous</span></a>'),
					$navNext = $('<a href="#next" class="nav next" id="nav_next"><span>Next</span></a>'),
					interval = false;
				
				// If it's not a touch device set the auto interval based on data-interval
				if (!supports.touch && parseInt($featureParent.attr('data-interval')))
					interval = parseInt($featureParent.attr('data-interval')*1000);
				
				// Add the previous and next links
				$featureParent.append($navPrev).append($navNext);
				
				// If the browser supports CSS Transforms use swipeJS
				if (Modernizr.csstransforms) {
					Modernizr.load({
						load: '/js/swipe.js',
						// On load of swipe
						complete: function() {
							var $feature = $featureParent.find('.inner');
							
							// Set up the slider
							var slider = new Swipe($feature[0], {
								callback: function(e, pos) {
									$slides.attr(aria, true);
									$slides.filter(':eq(' + pos + ')').attr(aria, false);
								}
							});
							
							// Set all but the first slide to be accessibly hidden
							$slides.filter(':not(:first-child)').attr(aria, true);
							
							// Implemenent clicking the previous link
							$navPrev.on('click', function(e) {
								e.preventDefault();
								slider.prev();
								// Stop any auto carousel
								if (interval) {
									window.clearTimeout(timer);
									interval = false;
								}
							});
							
							// Implemenent clicking the next link
							$navNext.on('click', function(e) {
								e.preventDefault();
								slider.next();
								// Stop any auto carousel
								if (interval) {
									window.clearTimeout(timer);
									interval = false;
								}
								
							});
															
							var carousel = function() {
								slider.next();
							};
							
							// Set up auto carousel
							if (interval) {
								timer = window.setInterval(carousel, interval);
								
								// Pause on hover, resume on mouse out
								$featureParent.hover(
									function() {
										if (interval)
											window.clearTimeout(timer);
									},
									function() {
										if (interval)
											timer = window.setInterval(carousel, interval);
									}
								);
							}
						}
					});
				}
				// Otherwise, if the browser doesn't support use CSS Transforms, use jQuery Cycle (and assume fixed size)
				else {
					$feature = $featureParent.find('.slider');
					var w = 'width: 100% !important';
					$feature.attr('style', w);
					$feature.find('li').attr('style', w);
					Modernizr.load({
						load: '/js/jquery.cycle.all.js',
						complete: function() {
							$feature.cycle({
								cleartypeNoBg: true,
								fx: 'scrollHorz',
								prev: '#nav_prev',
								next: '#nav_next',
								speed: 'fast',
								timeout: interval,
								after: function(curr, next, opts) {
									var idx = opts.currSlide
									$slides.attr(aria, true);
									$slides.filter(':eq(' + idx + ')').attr(aria, false);
								}
							});
						}
					});
				}
			}
		}
	}
};