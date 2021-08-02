import { Store } from 'types/contenful.types'
import { parseCSSColor } from 'csscolorparser'

type ThemeOverrideProps = {
  store: Store
}

const ThemeOverride: React.FC<ThemeOverrideProps> = ({
  store: { primaryColor = '#D25B5B', secondaryColor = '#828282' }
}) => {
  const primaryColorRgb = parseCSSColor(primaryColor)
  const secondaryColorRgb = parseCSSColor(primaryColor)

  return (
    <style jsx global>{`
      /**
     * Global Variables
     **/

      :root {
        --primary: ${primaryColor};
        --secondary: ${secondaryColor};
      }

      /**
       * Buttons
       **/

      .btn.focus,
      .btn:focus {
        box-shadow: 0 0 0 0.2rem rgba(${secondaryColorRgb[0]}, ${secondaryColorRgb[1]}, ${secondaryColorRgb[2]}, 0.25);
      }

      .btn-primary {
        background-color: ${primaryColor} !important;
        border-color: ${primaryColor} !important;
        color: white;
      }
      .btn-secondary {
        background-color: ${secondaryColor} !important;
        color: white;
      }
      .btn-dark {
        background-color: #252525;
        color: white !important;
      }

      .btn-outline-primary {
        color: ${primaryColor};
        border-color: ${primaryColor};
      }
      .btn-outline-primary:hover,
      .btn-outline-primary.active {
        background-color: ${primaryColor} !important;
        border-color: ${primaryColor} !important;
      }
      .btn-outline-secondary {
        color: ${secondaryColor};
        border-color: ${secondaryColor};
      }
      .btn-outline-secondary:hover,
      .btn-outline-secondary.active {
        background-color: ${secondaryColor} !important;
        border-color: ${secondaryColor} !important;
      }

      .btn-outline-primary:not(:disabled):not(.disabled).active:focus,
      .btn-outline-primary:not(:disabled):not(.disabled):active:focus,
      .btn-outline-primary:not(:disabled):not(.disabled):focus,
      .show > .btn-outline-primary.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(${primaryColorRgb[0]}, ${primaryColorRgb[1]}, ${primaryColorRgb[2]}, 0.5) !important;
      }

      .btn-outline-secondary:not(:disabled):not(.disabled).active:focus,
      .btn-outline-secondary:not(:disabled):not(.disabled):active:focus,
      .btn-outline-secondary:not(:disabled):not(.disabled):focus,
      .show > .btn-outline-secondary.dropdown-toggle:focus {
        box-shadow: 0 0 0 0.2rem rgba(${secondaryColorRgb[0]}, ${secondaryColorRgb[1]}, ${secondaryColorRgb[2]}, 0.5) !important;
      }

      /**
       * Text
       **/

      .text-primary {
        color: ${primaryColor} !important;
      }

      .text-secondary {
        color: ${secondaryColor} !important;
      }

      a {
        color: ${primaryColor} !important;
      }

      /**
       * External Component overrides
       **/
      // Product View - Image Carousel
      .image-gallery-thumbnail {
        border-color: transparent;
        border-width: 4px;
      }
      .image-gallery-thumbnail.active,
      .image-gallery-thumbnail:hover,
      .image-gallery-thumbnail:focus {
        border-color: ${primaryColor};
      }

      .image-gallery-image {
        max-width: 450px;
        width: 450px;
        height: 450px;
      }
      .image-gallery-thumbnail-inner {
        position: relative;
        line-height: 0;
        width: 92px !important;
        height: 92px !important;
      }
      .image-gallery-thumbnail-image {
        width: 100%;
        height: 100%;
        opacity: 0.01;
      }
      .image-gallery-thumbnail-overlay {
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
      }

      @media screen and (max-width: 1230px) {
        .image-gallery-image {
          max-width: 400px;
          width: 400px !important;
          height: 400px !important;
        }
      }

      @media screen and (max-width: 1040px) {
        .image-gallery-image {
          max-width: 350px;
          width: 350px !important;
          height: 350px !important;
        }
      }

      @media screen and (max-width: 980px) {
        .image-gallery-image {
          max-width: 300px;
          width: 300px !important;
          height: 300px !important;
        }
      }

      @media screen and (max-width: 880px) {
        .image-gallery-image {
          max-width: 250px;
          width: 250px !important;
          height: 250px !important;
        }
      }
      @media screen and (max-width: 768px) {
        .image-gallery-thumbnail-inner {
          width: 75px !important;
          height: 75px !important;
        }
      }
      @media screen and (max-width: 710px) {
        .image-gallery-image {
          max-width: 200px;
          width: 200px !important;
          height: 200px !important;
        }
      }
      .image-gallery-icon:hover {
        color: ${primaryColor};
      }
      .image-gallery-svg {
        height: 60px !important;
        width: 30px !important;
      }
      // Custom Colour Radio Buttons
      .custom-control-input:checked ~ .custom-control-label::before {
        border-color: ${primaryColor};
        background-color: ${primaryColor};
      }
      .custom-control-label {
        padding-top: 2px;
      }
    `}</style>
  )
}

export default ThemeOverride
