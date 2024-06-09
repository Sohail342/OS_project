// Initial recalculation of service time when the page is loaded
recalculateServiceTime();

// Hide elements with the class 'priority-only' when the page is loaded
$('.priority-only').hide();


$(document).ready(function () {
  // Set up an event handler for changes to the radio buttons with the name 'algorithm'
  $('input[type=radio][name=algorithm]').change(function () {
    // Check if the selected algorithm is 'priority'
    if (this.value == 'priority') {
      // Show elements with the class 'priority-only'
      $('.priority-only').show();
      // Show elements with the class 'servtime'
      $('.servtime').show();
      // Move the minus button to the left position of 604px
      $('#minus').css('left', '604px');
    } else {
      // Hide elements with the class 'priority-only'
      $('.priority-only').hide();
      // Show elements with the class 'servtime'
      $('.servtime').show();
      // Reset the minus button to the left position of 428px
      $('#minus').css('left', '428px');
    }

    // Check if the selected algorithm is 'robin'
    if (this.value == 'robin') {
      // Hide elements with the class 'servtime'
      $('.servtime').hide();
      // Show the element with id 'quantumParagraph'
      $('#quantumParagraph').show();
    } else {
      // Hide the element with id 'quantumParagraph'
      $('#quantumParagraph').hide();
      // Show elements with the class 'servtime'
      $('.servtime').show();
    }

    // Recalculate the service time whenever the algorithm selection changes
    recalculateServiceTime();
  });
});


function addRow() {
  // Select the last row in the input table
  var lastRow = $('#inputTable tr:last');
  
  // Get the row number from the second cell of the last row and convert it to an integer
  var lastRowNumebr = parseInt(lastRow.children()[1].innerText);

  // Create a new row with incremented process and row numbers, and inputs for execution time and priority
  var newRow = '<tr><td>P'
  + (lastRowNumebr + 1)
  + '</td><td>'
  + (lastRowNumebr + 1)
  + '</td><td><input class="exectime" type="text"/></td><td class="servtime"></td>'
  + '<td class="priority-only"><input type="text"/></td></tr>';

  // Append the new row after the last row
  lastRow.after(newRow);

  // Select the minus button
  var minus = $('#minus');
  // Show the minus button
  minus.show();
  // Move the minus button down by 24 pixels
  minus.css('top', (parseFloat(minus.css('top')) + 24) + 'px');

  // If the selected algorithm is not 'priority', hide the elements with the class 'priority-only'
  if ($('input[name=algorithm]:checked', '#algorithm').val() != "priority")
    $('.priority-only').hide();

  // Recalculate the service time when the input in the last row changes
  $('#inputTable tr:last input').change(function () {
    recalculateServiceTime();
  });
}


function deleteRow() {
  // Select the last row in the input table
  var lastRow = $('#inputTable tr:last');
  // Remove the last row from the table
  lastRow.remove();

  // Select the minus button
  var minus = $('#minus');
  // Move the minus button up by 24 pixels
  minus.css('top', (parseFloat(minus.css('top')) - 24) + 'px');

  // If the top position of the minus button is less than 150 pixels, hide the minus button
  if (parseFloat(minus.css('top')) < 150)
    minus.hide();
}


// Add an event listener for the change event on elements with the class 'initial'
$(".initial").change(function () {
  // Recalculate the service time when any of these elements change
  recalculateServiceTime();
});


function recalculateServiceTime() {
  // Get all the rows in the input table
  var inputTable = $('#inputTable tr');
  // Initialize total execution time to 0
  var totalExectuteTime = 0;

  // Get the selected algorithm value
  var algorithm = $('input[name=algorithm]:checked', '#algorithm').val();
  
  // First Come First Serve (FCFS) algorithm
  if (algorithm == "fcfs") {
    // Iterate over each row in the input table
    $.each(inputTable, function (key, value) {
      // Skip the first row (header row)
      if (key == 0) return true;
      
      // Set the service time of the current row
      $(value.children[3]).text(totalExectuteTime);

      // Get the execution time from the third cell (input field) of the current row
      var executeTime = parseInt($(value.children[2]).children().first().val());
      // Add the execution time to the total execution time
      totalExectuteTime += executeTime;
    });
  }
  // Shortest Job First (SJF) algorithm
  else if (algorithm == "sjf") {
    // Array to hold execution times
    var exectuteTimes = [];
    // Populate the execution times array
    $.each(inputTable, function (key, value) {
      if (key == 0) return true;
      exectuteTimes[key - 1] = parseInt($(value.children[2]).children().first().val());
    });

    // Variable to keep track of the current index
    var currentIndex = -1;
    // Iterate over the execution times
    for (var i = 0; i < exectuteTimes.length; i++) {
      // Find the next index with the shortest job
      currentIndex = findNextIndex(currentIndex, exectuteTimes);

      // If no valid index is found, return
      if (currentIndex == -1) return;

      // Set the service time for the current process
      $(inputTable[currentIndex + 1].children[3]).text(totalExectuteTime);

      // Add the execution time of the current process to the total execution time
      totalExectuteTime += exectuteTimes[currentIndex];
    }
  }
  // Priority scheduling algorithm
  else if (algorithm == "priority") {
    // Arrays to hold execution times and priorities
    var exectuteTimes = [];
    var priorities = [];

    // Populate the execution times and priorities arrays
    $.each(inputTable, function (key, value) {
      if (key == 0) return true;
      exectuteTimes[key - 1] = parseInt($(value.children[2]).children().first().val());
      priorities[key - 1] = parseInt($(value.children[4]).children().first().val());
    });

    // Variable to keep track of the current index
    var currentIndex = -1;
    // Iterate over the execution times
    for (var i = 0; i < exectuteTimes.length; i++) {
      // Find the next index based on priority
      currentIndex = findNextIndexWithPriority(currentIndex, priorities);

      // If no valid index is found, return
      if (currentIndex == -1) return;

      // Set the service time for the current process
      $(inputTable[currentIndex + 1].children[3]).text(totalExectuteTime);

      // Add the execution time of the current process to the total execution time
      totalExectuteTime += exectuteTimes[currentIndex];
    }
  }
  // Round Robin (Robin) algorithm
  else if (algorithm == "robin") {
    // Move the minus button to the left position of 335px
    $('#minus').css('left', '335px');
    // Iterate over each row in the input table
    $.each(inputTable, function (key, value) {
      // Skip the first row (header row)
      if (key == 0) return true;
      // Clear the service time for the current row
      $(value.children[3]).text("");
    });
  }
}



function findNextIndexWithPriority(currentIndex, priorities) {
  // Initialize currentPriority to a very large number
  var currentPriority = 1000000;
  
  // If currentIndex is valid, update currentPriority with the priority of the current process
  if (currentIndex != -1) currentPriority = priorities[currentIndex];
  
  // Initialize resultPriority and resultIndex to default values
  var resultPriority = 0;
  var resultIndex = -1;
  
  // Initialize flags to track conditions
  var samePriority = false;
  var areWeThereYet = false;

  // Iterate over each priority in the priorities array
  $.each(priorities, function (key, value) {
    // Initialize a flag to track changes in this iteration
    var changeInThisIteration = false;

    // Skip the current index and processes with higher priority
    if (key == currentIndex) {
      areWeThereYet = true;
      return true; // Skip to the next iteration
    }
    
    // Check if the current priority is less than or equal to the currentPriority
    // and greater than or equal to the resultPriority
    if (value <= currentPriority && value >= resultPriority) {
      // If the value is the same as the resultPriority
      if (value == resultPriority) {
        // If the currentPriority is the same and samePriority flag is false
        if (currentPriority == value && !samePriority) {
          // Set samePriority flag to true, indicating processes with the same priority
          samePriority = true;
          // Set changeInThisIteration flag to true, indicating a change occurred
          changeInThisIteration = true;
          // Update resultPriority and resultIndex
          resultPriority = value;
          resultIndex = key;                            
        }                        
      }
      // If the value is the same as the currentPriority
      else if (value == currentPriority) {
        // If we've reached the current index, set samePriority flag to true
        if (areWeThereYet) {
          samePriority = true;
          areWeThereYet = false;
          changeInThisIteration = true;
          resultPriority = value;
          resultIndex = key;
        }
      }
      // If the value is greater than the resultPriority, update resultPriority and resultIndex
      else {
        resultPriority = value;
        resultIndex = key;
      }

      // If the value is greater than the resultPriority and no change occurred in this iteration
      // set samePriority flag to false
      if (value > resultPriority && !changeInThisIteration)
        samePriority = false;
    }
  });
  
  // Return the index of the process with the next highest priority
  return resultIndex;
}


function findNextIndex(currentIndex, array) {
  // Initialize currentTime to 0
  var currentTime = 0;
  
  // If currentIndex is valid, update currentTime with the value of the current process
  if (currentIndex != -1) currentTime = array[currentIndex];
  
  // Initialize resultTime to a very large number and resultIndex to -1
  var resultTime = 1000000;
  var resultIndex = -1;
  
  // Initialize flags to track conditions
  var sameTime = false;
  var areWeThereYet = false;

  // Iterate over each value in the array
  $.each(array, function (key, value) {
    // Initialize a flag to track changes in this iteration
    var changeInThisIteration = false;

    // Skip the current index and processes with earlier execution times
    if (key == currentIndex) {
      areWeThereYet = true;
      return true; // Skip to the next iteration
    }
    
    // Check if the value is greater than or equal to currentTime and less than or equal to resultTime
    if (value >= currentTime && value <= resultTime) {
      // If the value is the same as resultTime
      if (value == resultTime) {
        // If the currentTime is the same and sameTime flag is false
        if (currentTime == value && !sameTime) {
          // Set sameTime flag to true, indicating processes with the same execution time
          sameTime = true;
          // Set changeInThisIteration flag to true, indicating a change occurred
          changeInThisIteration = true;
          // Update resultTime and resultIndex
          resultTime = value;
          resultIndex = key;                            
        }                        
      }
      // If the value is the same as currentTime
      else if (value == currentTime) {
        // If we've reached the current index, set sameTime flag to true
        if (areWeThereYet) {
          sameTime = true;
          areWeThereYet = false;
          changeInThisIteration = true;
          resultTime = value;
          resultIndex = key;
        }
      }
      // If the value is less than the resultTime, update resultTime and resultIndex
      else {
        resultTime = value;
        resultIndex = key;
      }

      // If the value is less than resultTime and no change occurred in this iteration
      // set sameTime flag to false
      if (value < resultTime && !changeInThisIteration)
        sameTime = false;
    }
  });
  
  // Return the index of the process with the next shortest execution time
  return resultIndex;
}


function animate() {
  // Prepend a div with id "curtain" to the element with tag name 'fresh'
  // This div will serve as the animated curtain
  $('fresh').prepend('<div id="curtain" style="position: absolute; right: 0; width:100%; height:100px;"></div>');
  
  // Set the width of the curtain to match the width of the result table
  $('#curtain').width($('#resultTable').width());
  
  // Position the curtain horizontally to align with the result table
  $('#curtain').css({left: $('#resultTable').position().left});
  
  // Initialize a variable to store the total sum of execution times
  var sum = 0;
  
  // Iterate over each input element with class 'exectime' and calculate the sum of their values
  $('.exectime').each(function() {
      sum += Number($(this).val());
  });
  
  // Log the width of the result table to the console
  console.log($('#resultTable').width());
  
  // Get the width of the curtain
  var distance = $("#curtain").css("width");
  
  // Call the animationStep function to animate the curtain
  // Pass the total sum of execution times and initial step count (0)
  animationStep(sum, 0);
  
  // Animate the curtain to simulate the execution of processes
  // The curtain will shrink to the left with a linear animation over a duration calculated based on the sum of execution times
  jQuery('#curtain').animate({ width: '0', marginLeft: distance}, sum * 1000 / 2, 'linear');
}


function animationStep(steps, cur) {
  // Update the HTML content of the element with id 'timer' to display the current step
  $('#timer').html(cur);
  
  // Check if the current step is less than the total steps
  if (cur < steps) {
    // If so, set a timeout to call the animationStep function again with the next step after 500 milliseconds
    setTimeout(function(){ 
      animationStep(steps, cur + 1);
    }, 500);
  } else {
    // If the current step is equal to or greater than the total steps, do nothing
    // This signifies the end of the animation
  }
}


function draw() {
  // Clear the HTML content inside the element with the tag 'fresh'
  $('fresh').html('');
  
  // Select the table rows within the element with the id 'inputTable'
  var inputTable = $('#inputTable tr');
  
  // Initialize variables to store table header (th) and table data (td)
  var th = '';
  var td = '';

  // Determine the selected algorithm by checking the value of the radio button named 'algorithm'
  var algorithm = $('input[name=algorithm]:checked', '#algorithm').val();
  
  // Check the selected algorithm and execute corresponding code blocks
  if (algorithm == "fcfs") {
    // Loop through each row in the input table
    $.each(inputTable, function (key, value) {
      // Skip the header row
      if (key == 0) return true;
      // Extract the execution time from the input and calculate the width for the table cell
      var executeTime = parseInt($(value.children[2]).children().first().val());
      // Construct table header and data elements
      th += '<th style="height: 60px; width: ' + executeTime * 20 + 'px;">P' + (key - 1) + '</th>';
      td += '<td>' + executeTime + '</td>';
    });

    // Populate the 'fresh' element with a table containing the constructed headers and data
    $('fresh').html('<table id="resultTable"><tr>'
                    + th
                    + '</tr><tr>'
                    + td
                    + '</tr></table>'
                   );
  }
  else if (algorithm == "sjf") {
    // Initialize an array to store execution times
    var executeTimes = [];

    // Loop through each row in the input table
    $.each(inputTable, function (key, value) {
      // Skip the header row
      if (key == 0) return true;
      // Extract the execution time from the input and store it in the executeTimes array
      var executeTime = parseInt($(value.children[2]).children().first().val());
      executeTimes[key - 1] = { "executeTime": executeTime, "P": key - 1 };
    });

    // Sort the executeTimes array based on execution time
    executeTimes.sort(function (a, b) {
      if (a.executeTime == b.executeTime)
        return a.P - b.P;
      return a.executeTime - b.executeTime
    });

    // Construct table header and data elements based on the sorted executeTimes array
    $.each(executeTimes, function (key, value) {
      th += '<th style="height: 60px; width: ' + value.executeTime * 20 + 'px;">P' + value.P + '</th>';
      td += '<td>' + value.executeTime + '</td>';
    });

    // Populate the 'fresh' element with a table containing the constructed headers and data
    $('fresh').html('<table id="resultTable"><tr>'
                    + th
                    + '</tr><tr>'
                    + td
                    + '</tr></table>'
                   );
  }
  // Additional cases for other algorithms (priority and robin) follow a similar structure
  
  // Call the animate function to start the animation
  animate();
}
