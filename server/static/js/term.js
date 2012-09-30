define(
['rmc_backbone', 'ext/underscore', 'course', 'jquery.slide', 'user_course'],
function(RmcBackbone, _, _course, jqSlide, _user_course) {

  var TermModel = RmcBackbone.Model.extend({
    defaults: {
      'name': 'Fall 2012',
      'program_year_id': '3A',
      'user_course_ids': []
    },

    referenceFields: {
      'user_courses': ['user_course_ids', _user_course.UserCourses]
    },

    idAttribute: 'name'
  });


  var TermView = RmcBackbone.View.extend({
    className: 'term',

    initialize: function(options) {
      this.termModel = options.termModel;

      // TODO(mack): clean up how we do this, whether we should be
      // getting courses directly or through this convoluted process
      var courseIds = this.termModel.get('user_courses').map(function(uc) {
        return uc.get('course_id');
      });
      this.courses = _course.CourseCollection.getFromCache(courseIds);

      this.expand = options.expand;
    },

    render: function(options) {
      var attributes = this.termModel.toJSON();
      attributes.expand = this.expand;

      this.$el.html(
        _.template($('#term-tpl').html(), attributes));

      this.courseCollectionView = new _course.CourseCollectionView({
        courses: this.courses
      });
      this.$el.find('.course-collection-placeholder').replaceWith(
        this.courseCollectionView.render().el);

      if (!this.expand) {
        this.$('.course-collection').addClass('hide-initial');
      }

      return this;
    },

    events: {
      'click .term-name': 'toggleTermVisibility'
    },

    // TODO(mack): remove duplicate with similar logic in CourseView
    toggleTermVisibility: function(evt) {
      if (this.$('.course-collection').is(':visible')) {
        this.collapseTerm(evt);
      } else {
        this.expandTerm(evt);
      }
    },

    expandTerm: function(evt) {
      this.$('.course-collection').fancySlide('down')
        .end().find('.term-name .arrow')
          .removeClass('icon-caret-right')
          .addClass('icon-caret-down');
    },

    collapseTerm: function(evt) {
      this.$('.course-collection').fancySlide('up')
        .end().find('.term-name .arrow')
          .removeClass('icon-caret-down')
          .addClass('icon-caret-right');
    }

  });


  var TermCollection = RmcBackbone.Collection.extend({
    model: TermModel
  });


  var TermCollectionView = RmcBackbone.View.extend({
    tagName: 'ol',
    className: 'term-collection',

    initialize: function(attributes) {
      this.termCollection = attributes.termCollection;
      this.termViews = [];
    },

    render: function() {
      this.$el.empty();
      this.termCollection.each(function(termModel, idx) {
        var expand = idx < 3;
        var termView = new TermView({
          tagName: 'li',
          termModel: termModel,
          expand: expand
        });
        this.$el.append(termView.render().el);
        this.termViews.push(termView);
      }, this);

      return this;
    }
  });

  return {
    TermModel: TermModel,
    TermView: TermView,
    TermCollection: TermCollection,
    TermCollectionView: TermCollectionView
  };
});
