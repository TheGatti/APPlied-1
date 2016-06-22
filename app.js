
$(document).ready(function() {

  apply.init();
});

var apply = {
    init: function() {
        apply.events();
        apply.styling();
    },
    styling: function() {

    },
    loadedJobs: [],
    events: function() {
        $('#logInButton').on('click', function() {
          event.preventDefault();
            var user = {
                username: $('#userName').val(),
                password: $('#password').val()
            };

            $('#logIn').fadeOut(2000, function() {
                $('header').removeClass('hidden');
            });
            console.log(JSON.stringify(user));
            $.ajax({
                method: "POST",
                url: "/login",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(user),
                success: function(data){
                  console.log("this is my login",data);
                },
                error:function(err){
                  console.error("something went wrong",err);
                }

            });

           apply.read();

        });

        $('#apply').on('click', function(){
          event.preventDefault();
          var jobs = {
            companyName: $('input[name = "company"]').val(),
            salary: $('input[name = "salary"]').val(),
            applied:  true,
            location:  $('input[name = "location"]').val(),
            contactName:  $('input[name = "contactName"]').val(),
            contactNumber:  $('input[name = "phone"]').val(),
            contactEmail:  $('input[name = "email"]').val(),
            comments:  $('textarea[name = "comments"]').val()
          };
          console.log(jobs);
          apply.create(JSON.stringify(jobs));
          apply.read();
        });
    },


    create: function(applyData) {
        $.ajax({
            url: "/jobs",
            method: "POST",
            contentType: "application/json; charset=utf-8",
            data: applyData,
            success: function(data) {
                apply.read();
                console.log(data);
            },
            error: function(err) {
                console.error(err);
            }
        });
    },
    read: function() {
        $.ajax({
            url: "/jobs",
            method: "GET",
            success: function(data) {
                $('#appliedTo ul').html('');
                console.log(data);
                data = JSON.parse(data);
                data.forEach(function(item){
                  console.log('this is the item',item);
                  $('#appliedTo ul').append(`<li data-jobid="${item.jobId}"><fieldset>
                    Company: <span>${item.companyName}</span> <input type="text" class="company-edit edit-hidden" value="${item.companyName}"></br>
                    Salary: <span>${item.location}</span> <input type="text" class="location-edit edit-hidden" value="${item.location}"></br>
                    Location: <span>${item.salary}</span> <input type="text" class="salary-edit edit-hidden" value="${item.salary}"></br>
                    Contact-Name: <span>${item.contactName}</span> <input type="text" class="contactName-edit edit-hidden" value="${item.contactName}"></br>
                    Contact-Number: <span>${item.contactNumber}</span> <input type="text" class="contactNumber-edit edit-hidden" value="${item.contactNumber}"></br>
                    Contact-Email: <span>${item.contactEmail}</span> <input type="text" class="contactEmail-edit edit-hidden" value="${item.contactEmail}"></br>
                    Comments: <span>${item.comments}</span> <input type="text" class="comments-edit edit-hidden" value="${item.comments}"></fieldset>
                    <button class='delete-btn' data-jobid="${item.jobId}">deleteAPP</button>
                    <button class="edit-btn edit-hidden" data-jobid="${item.jobId}">editAPP</button>
                    <button class="show-edit-btn">edit</button>
                    </li>`);
                });
                apply.destroyButton ();
            },
            error: function(err) {
                console.error(err);
            }
        });
    },
    update: function(applyData) {
        $.ajax({
            url: "/jobs",
            method: "PUT",
            contentType: "application/json; charset=utf-8",
            data: applyData,
            success:function(data) {
              apply.read();
            },
            error:function(err) {
              console.error(err);
            }
        });
    },
    destroy: function(id) {
        $.ajax({
            url: "/jobs/" + id,
            method: "DELETE",
            success:function(data) {
                apply.read();
            },
            error: function(err) {
                console.error(err);
            }
        });
    },

    destroyButton: function () {
      $('.delete-btn').on('click', function (event){
        event.preventDefault();
        var clearAPP = $(this).data('jobid');
        console.log("cleared", clearAPP);
        apply.destroy(clearAPP);
      });
      $(".edit-btn").on("click", function (event){
        event.preventDefault();
        var appParent = $(this).parent();
        var jobs = {
          companyName: appParent.find('.company-edit').val(),
          salary: appParent.find('.salary-edit').val(),
          applied:  true,
          location:  appParent.find('.location-edit').val(),
          contactName:  appParent.find('.contactName-edit').val(),
          contactNumber:  appParent.find('.contactNumber-edit').val(),
          contactEmail:  appParent.find('.contactEmail-edit').val(),
          comments:  appParent.find('.comments-edit').val(),
          jobId: appParent.data("jobid"),
        };
        console.log("edited", jobs);
        apply.update(JSON.stringify(jobs));
      });
      $('.show-edit-btn').on('click', function (event){
        event.preventDefault();
        var editAPP = $(this).parent();
        console.log("edited", editAPP);
        editAPP.find("span").toggleClass("edit-hidden");
        editAPP.find("input").toggleClass("edit-hidden");
        editAPP.find("button").toggleClass("edit-hidden");
      });
    }
};
