import Lenis from "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/+esm";
window.addEventListener("DOMContentLoaded", () => {

  console.clear();
  gsap.registerPlugin(ScrollTrigger);

  const StickySection = document.querySelector("section.sticky");
  const SliderContainer = StickySection.querySelector(".slider-container");
  const Slider = SliderContainer.querySelector(".slider");
  const Slides = document.querySelectorAll('.slider .slide');

  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  let ScrollHeight = Slides.length * innerHeight;
  let CurrentSlide = 0;

  function SetupObserver(threshold = [0,.025]) {

    // Attach IntersectionObserver after slides are created
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          const CurrentIdx = Number(entry.target.getAttribute("key"));
          if (entry.intersectionRatio >= 0.25) {
            CurrentSlide = CurrentIdx;
            Slides.forEach((slide, si) => {
              gsap.to(slide.querySelectorAll("h1"), {
                y: si == CurrentSlide ? 0 : -200,
                duration: 0.3,
                stagger: 0.03,
                ease: [0.25, 1, 0.5, 1],
                overwrite: true,
              });
            });
          } else if (
            entry.intersectionRatio < 0.25 &&
            CurrentSlide == CurrentIdx
          ) {
            let PrevIdx = CurrentIdx - 1;
            CurrentSlide = PrevIdx >= 0 ? PrevIdx : null;
            Slides.forEach((slide, si) => {
              gsap.to(slide.querySelectorAll("h1"), {
                y: si == PrevIdx ? 0 : -200,
                duration: 0.3,
                stagger: 0.03,
                ease: [0.25, 1, 0.5, 1],
                overwrite: true,
              });
            });
          }
        });
      },
      {
        threshold,
        root: StickySection.querySelector(".slider-container"),
        rootMargin: "0px",
      }
    );

    Slides.forEach((slide) => {
      observer.observe(slide);
    });
  }

  // Initialize the data display
  SetupObserver([0,.55]);

  // Ensure ScrollTrigger detects layout after all elements are created
  ScrollTrigger.create({
    trigger: StickySection,
    start: "top top",
    end: `+=${ScrollHeight}px`,
    pin: true,
    scrub: 2,
    onUpdate: (self) => {
      const Prog = self.progress;

      gsap.set('.scroll-line',{
        scaleY:Prog
      })

      const SlideWidth = Slides[0].getBoundingClientRect().width;

      const TotalTranslationX = Slides.length * SlideWidth - SlideWidth // Subtracting The Offset Width so that it does not overtranslate 
      const TranslationX = TotalTranslationX * Prog

      gsap.set(Slider,{
        x:-TranslationX
      })

      const OnGoingSlide = Math.floor(TranslationX / SlideWidth)
      Slides.forEach((slide,index) => {
        const Img = slide.querySelector('img')
        if (!Img) return;
        if(index == OnGoingSlide || index == OnGoingSlide + 1){
          const SlideProgress = (TranslationX % SlideWidth) / SlideWidth;
          const RelativeProg = index == OnGoingSlide ? SlideProgress : SlideProgress - 1;
          const RelativeTranslationX = SlideWidth * RelativeProg * .25;

          // Make Sure To Set The overflow hidden of every slide
          gsap.set(Img,{
            x:RelativeTranslationX,
            scale:1.3
          })

          
        } else {
          gsap.set(Img,{
            x:0,
            scale:1
          })
        }
        
      })

    },
  });
  // Trigger a refresh to ensure everything is initialized properly
  ScrollTrigger.refresh();

  // Optional: Resize handling to ensure correct dimensions
  window.addEventListener("resize", () => {
    ScrollHeight = Slides.length * innerHeight;
    ScrollTrigger.refresh();
    window.location.reload();
  });
});
