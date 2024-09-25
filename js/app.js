const generateForm = document.querySelector(".generate-form");
const ImageGallery = document.querySelector(".image-gallery");

// Use your actual API key herecon
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
async function generateAiImages(userPrompt, userImageQuantity) {
    function updateImageCard(imgDataArray) {
        imgDataArray.forEach((imgObject, index) => {
            const imgCard = ImageGallery.querySelectorAll(".img-card")[index];
            const imgElement = imgCard.querySelector("img");
            const downloadBtn = imgCard.querySelector(".download-btn");

            const aiGeneratedImg = `data:image/jpeg;base64,${imgObject.b64_json}`;
            imgElement.src = aiGeneratedImg;

            imgElement.onload = () => {
                imgCard.classList.remove("loading");
                downloadBtn.setAttribute("href", aiGeneratedImg);
                downloadBtn.setAttribute("download", `${userPrompt}.jpg`);
            };
        });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                prompt: userPrompt,
                n: parseInt(userImageQuantity),
                size: "512x512",
                response_format: "b64_json"
            })
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            throw new Error(`Failed to generate images: ${errorDetails.error.message}`);
        }

        const { data } = await response.json();
        console.log(data);
        updateImageCard(data);

    } catch (error) {
        alert(error.message);
    }
}

generateForm.addEventListener("submit", function (event) {
    // Prevent default form submission
    event.preventDefault();

    // User input and image quantity values from the form
    const userPrompt = event.target[0].value;
    const userImageQuantity = event.target[1].value;

    // Creating HTML markup for image cards with loading state
    const imgCardMarkup = Array.from({ length: userImageQuantity }, () => {
        return (
            `<div class="img-card loading">
                <img decoding="async" src="images/loader.svg" alt="Loading image">
                <a href="#" class="download-btn">
                    <img decoding="async" src="images/download.svg" alt="Download icon">
                </a>
            </div>`
        );
    }).join("");

    ImageGallery.innerHTML = imgCardMarkup;
    generateAiImages(userPrompt, userImageQuantity);
});

