const BuyMeACoffee = () => {
  return (
    <a
      href='https://www.buymeacoffee.com/seanbuildsthings'
      className='inline-block rounded-md'
    >
      {/* Third-party badge generated on the fly by the Buy Me a Coffee API
          with its text/colours baked into the image itself — next/image
          can't optimise an arbitrary remote badge like this without adding
          a remote pattern to next.config.js, which is out of scope for a
          presentation-only pass, so a plain <img> stays with a real alt. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src='https://img.buymeacoffee.com/button-api/?text=Buy me a coffee or a beer!&emoji=&slug=seanbuildsthings&button_colour=484747&font_colour=ffffff&font_family=Lato&outline_colour=ffffff&coffee_colour=FFDD00'
        alt='Buy Sean a coffee or a beer on Buy Me a Coffee'
        className='h-auto max-w-full rounded-md'
      />
    </a>
  );
};

export default BuyMeACoffee;
