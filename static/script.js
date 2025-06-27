document.getElementById('generateStory').addEventListener('click', async () => {
  const genre = document.getElementById('genre').value;
  const setting = document.getElementById('setting').value;
  const characters = document.getElementById('characters').value;
  const prompt = document.getElementById('prompt').value;
  const loadingStory = document.getElementById('loadingStory');
  const storyOutput = document.getElementById('storyOutput');

  if (!prompt) {
    alert("Please enter a prompt!");
    return;
  }

  loadingStory.style.display = 'block';
  storyOutput.textContent = '';

  try {
    const response = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, genre, setting, characters })
    });

    const data = await response.json();
    loadingStory.style.display = 'none';

    if (data.story) {
      storyOutput.textContent = data.story;
    } else {
      alert(data.error || "Failed to generate story.");
    }
  } catch (error) {
    loadingStory.style.display = 'none';
    alert("Error generating story: " + error.message);
  }
});

document.getElementById('generateImage').addEventListener('click', async () => {
  const prompt = document.getElementById('prompt').value;
  const loadingImage = document.getElementById('loadingImage');
  const generatedImage = document.getElementById('generatedImage');

  if (!prompt) {
    alert("Please enter a prompt for the image!");
    return;
  }

  loadingImage.style.display = 'block';
  generatedImage.style.display = 'none';

  try {
    const response = await fetch('/generate_image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    const data = await response.json();
    loadingImage.style.display = 'none';

    if (data.image_url) {
      generatedImage.src = data.image_url;
      generatedImage.style.display = 'block';

      generatedImage.onerror = () => {
        generatedImage.style.display = 'none';
        alert("Failed to load the generated image. Image might be missing or corrupted.");
      };
    } else {
      alert(data.error || "Failed to generate image.");
    }
  } catch (error) {
    loadingImage.style.display = 'none';
    alert("Error generating image: " + error.message);
  }
});

document.getElementById('resetAll').addEventListener('click', () => {
  document.getElementById('genre').value = 'fantasy';
  document.getElementById('setting').value = 'medieval';
  document.getElementById('characters').value = '';
  document.getElementById('prompt').value = '';
  document.getElementById('storyOutput').textContent = '';
  const imageElement = document.getElementById('generatedImage');
  imageElement.src = '';
  imageElement.alt = '';
  imageElement.style.display = 'none';
});

document.getElementById('copyStory').addEventListener('click', () => {
  const story = document.getElementById('storyOutput').textContent;
  if (story) {
    navigator.clipboard.writeText(story).then(() => alert("Story copied to clipboard!"));
  } else {
    alert("No story to copy.");
  }
});

document.getElementById('copyImage').addEventListener('click', () => {
  const imageUrl = document.getElementById('generatedImage').src;
  if (imageUrl && imageUrl.startsWith('http')) {
    navigator.clipboard.writeText(imageUrl).then(() => alert("Image URL copied to clipboard!"));
  } else {
    alert("No valid image URL to copy.");
  }
});

document.getElementById('mode').addEventListener('change', (event) => {
  const mode = event.target.value;
  const storyControls = ['genre', 'setting', 'characters', 'generateStory', 'copyStory'];
  const imageControls = ['generateImage', 'copyImage'];

  if (mode === 'story') {
    storyControls.forEach(id => document.getElementById(id).disabled = false);
    imageControls.forEach(id => document.getElementById(id).disabled = true);
  } else {
    storyControls.forEach(id => document.getElementById(id).disabled = true);
    imageControls.forEach(id => document.getElementById(id).disabled = false);
  }
});