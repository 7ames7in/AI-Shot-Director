import React, { useState, useCallback } from 'react';
import { CameraAngle, CameraShot, CameraLevel, GeneratedImage } from './types';
import { CAMERA_ANGLES, CAMERA_SHOTS, CAMERA_LEVELS } from './constants';
import { generateImageFromImages } from './services/geminiService';
import { OptionSelector } from './components/OptionSelector';
import { AngleIcon, ShotSizeIcon, LevelIcon, CameraIcon, UploadIcon, PencilIcon, DownloadIcon, CopyIcon, TrashIcon } from './components/icons';

const Spinner = ({ size = 'h-5 w-5', className = '' }: { size?: string; className?: string }) => (
  <svg className={`animate-spin ${size} text-white ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

interface SourceImage {
  file: File;
  previewUrl: string;
}

interface ImageUploaderProps {
  onImageUpload: (files: FileList) => void;
  onImageRemove: (index: number) => void;
  images: SourceImage[];
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, onImageRemove, images }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onImageUpload(event.target.files);
      event.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
      <div className="bg-gray-800 border-2 border-dashed border-gray-600 rounded-xl p-4 min-h-[16rem] flex flex-col items-center justify-center">
        {images.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 w-full">
            {images.map((image, index) => (
              <div key={index} className="relative group aspect-square">
                <img src={image.previewUrl} alt={`Preview ${index + 1}`} className="object-cover h-full w-full rounded-md" />
                <button
                  onClick={() => onImageRemove(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
            <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center aspect-square bg-gray-700/50 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
              <span className="text-3xl font-light">+</span>
            </label>
          </div>
        ) : (
          <label
            htmlFor="file-upload"
            className="relative cursor-pointer transition-all duration-300 flex flex-col justify-center items-center text-center w-full h-full p-4"
          >
            <UploadIcon className="w-12 h-12 mb-3 text-gray-400" />
            <span className="font-semibold text-gray-400">Click to upload images</span>
            <p className="text-xs mt-1 text-gray-500">Combine multiple images into one</p>
          </label>
        )}
      </div>
    </div>
  );
};

interface GeneratedImagesProps {
  originalImages: string[];
  generatedImage: GeneratedImage | null;
  isLoading: boolean;
}

const GeneratedImages: React.FC<GeneratedImagesProps> = ({ originalImages, generatedImage, isLoading }) => {
  const [isCopied, setIsCopied] = useState(false);

  if (originalImages.length === 0) return null;
  
  const handleDownload = () => {
    if (!generatedImage?.src) return;
    const link = document.createElement('a');
    link.href = generatedImage.src;
    const mimeType = generatedImage.src.split(';')[0].split(':')[1];
    const extension = mimeType.split('/')[1] || 'png';
    link.download = `ai-generated-shot.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!generatedImage?.src || !navigator.clipboard.write) {
        alert("Copying not supported or no image to copy.");
        return;
    };
    try {
      const response = await fetch(generatedImage.src);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy image:", err);
      alert("Failed to copy image to clipboard.");
    }
  };


  return (
    <div className="mt-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4 text-center text-gray-300">Originals</h3>
          <div className="bg-gray-800 p-2 rounded-xl shadow-lg">
             <div className="grid grid-cols-2 gap-2">
                 {originalImages.map((src, index) => (
                    <img key={index} src={src} alt={`Original ${index + 1}`} className="rounded-lg w-full h-auto aspect-square object-contain bg-gray-700/50" />
                ))}
             </div>
          </div>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-4 text-center text-cyan-400">Generated</h3>
          <div className="bg-gray-800 p-2 rounded-xl shadow-lg h-full flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-center aspect-square bg-gray-700/50 rounded-lg">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center">
                        <Spinner size="h-12 w-12" />
                        <p className="text-gray-400 mt-4 text-lg">Generating your shot...</p>
                    </div>
                ) : generatedImage ? (
                    <img src={generatedImage.src} alt={generatedImage.prompt} className="rounded-lg w-full h-auto aspect-square object-contain" />
                ) : (
                    <p className="text-gray-400">AI image will appear here</p>
                )}
            </div>
            {!isLoading && generatedImage && (
              <div className="mt-4 flex w-full justify-center gap-4">
                <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out bg-gray-700 text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Download
                </button>
                <button
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ease-in-out bg-gray-700 text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
                >
                    <CopyIcon className="w-5 h-5" />
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default function App() {
  const [sourceImages, setSourceImages] = useState<SourceImage[]>([]);
  
  const [selectedAngle, setSelectedAngle] = useState<CameraAngle>(CameraAngle.LeftSide);
  const [selectedShot, setSelectedShot] = useState<CameraShot>(CameraShot.CloseUp);
  const [selectedLevel, setSelectedLevel] = useState<CameraLevel>(CameraLevel.EyeLevel);
  const [additionalPrompt, setAdditionalPrompt] = useState<string>('');
  
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (files: FileList) => {
    const newImageFiles = Array.from(files);
    if (newImageFiles.length === 0) return;

    setGeneratedImage(null);

    const imagePromises = newImageFiles.map(file => {
      return new Promise<SourceImage>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ file, previewUrl: reader.result as string });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then(newImages => {
        setSourceImages(prevImages => [...prevImages, ...newImages]);
      })
      .catch(err => {
        setError("Failed to read image files.");
        console.error(err);
      });
  };
  
  const handleImageRemove = (indexToRemove: number) => {
    setSourceImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
  };


  const handleGenerateClick = useCallback(async () => {
    if (sourceImages.length === 0) {
      setError("Please upload at least one image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
        const imageData = sourceImages.map(img => ({
            base64ImageData: img.previewUrl.split(',')[1],
            mimeType: img.file.type,
        }));
        
        const basePrompt = `Combine the provided images into a single cohesive image, viewed from a new perspective: ${selectedShot}, ${selectedAngle}, ${selectedLevel}.`;
        const prompt = additionalPrompt ? `${basePrompt} ${additionalPrompt}` : basePrompt;
        
        const resultSrc = await generateImageFromImages(imageData, prompt);
        
        if(resultSrc) {
            setGeneratedImage({ src: resultSrc, prompt });
        } else {
            setError("The AI could not generate an image from the response. Please try again.");
        }
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  }, [sourceImages, selectedAngle, selectedShot, selectedLevel, additionalPrompt]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10 md:mb-16">
            <div className="inline-flex items-center justify-center bg-gray-800 p-3 rounded-full mb-4">
                <CameraIcon className="w-10 h-10 text-cyan-400" />
            </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
            AI Shot Director
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            Upload one or more images, choose a perspective, and our AI will generate a new, combined shot for you.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Controls Column */}
          <div className="lg:col-span-1 bg-gray-800/50 p-6 rounded-2xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-white">1. Upload Image(s)</h2>
            <ImageUploader 
                onImageUpload={handleImageUpload} 
                onImageRemove={handleImageRemove}
                images={sourceImages} 
            />
            
            <h2 className="text-2xl font-bold mt-8 mb-4 text-white">2. Set Perspective</h2>
            <OptionSelector
              title="Camera Angle"
              options={CAMERA_ANGLES}
              selectedOption={selectedAngle}
              onOptionSelect={(option) => setSelectedAngle(option)}
              IconComponent={AngleIcon}
            />
            <OptionSelector
              title="Camera Shot"
              options={CAMERA_SHOTS}
              selectedOption={selectedShot}
              onOptionSelect={(option) => setSelectedShot(option)}
              IconComponent={ShotSizeIcon}
            />
            <OptionSelector
              title="Camera Level"
              options={CAMERA_LEVELS}
              selectedOption={selectedLevel}
              onOptionSelect={(option) => setSelectedLevel(option)}
              IconComponent={LevelIcon}
            />

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center">
                <PencilIcon className="w-5 h-5 mr-2 text-cyan-400" />
                Additional Details (Optional)
              </h3>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="e.g., 'Make it a rainy day', 'Change the color of the car to red'"
                className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 resize-y"
                rows={3}
                aria-label="Additional details for image generation"
              />
            </div>
            
            <div className="mt-8">
                <button
                onClick={handleGenerateClick}
                disabled={isLoading || sourceImages.length === 0}
                className="w-full flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                {isLoading ? <><Spinner className="-ml-1 mr-3" /> Generating...</> : '✨ Generate New Shot'}
                </button>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 p-6 rounded-2xl shadow-2xl border border-gray-700 min-h-full">
              <h2 className="text-2xl font-bold mb-6 text-white">3. View Result</h2>
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
              <GeneratedImages originalImages={sourceImages.map(img => img.previewUrl)} generatedImage={generatedImage} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Google Gemini. Created for creative exploration.</p>
      </footer>
    </div>
  );
}