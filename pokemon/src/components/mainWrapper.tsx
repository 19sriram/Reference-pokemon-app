import { useState, useEffect, Fragment }  from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import Loader from "./loader/loader";
import HeaderComponent from "../components/headerComponent/headerComponent";
import Broken from "./brokenScreen/brokenScreen";
import { fetchPokemonData } from "./common/api";
import SlideDrawer from "./sideDrawer/sideDrawer";

import "./mainWrapper.scss";

export default function MainWrapper() {
  const [allPokemonList, setAllPokemonList] = useState([] as any);
  const [broken, setBroken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState([] as any);
  const [nextPageURL, setNextPageURL] = useState("");
  const [prevPageURL, setPrevPageURL] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  /**
   * Initial Fetch
   * Fetches data as per url, limit and offset
   * {url: string, limit: number, offset: number}
   * fetchData(url,limit, offset)
   */

  const fetchData = (url: string|any, limit?: number, offset?: number) => {
    try {
      setIsLoading(true);
      return fetchPokemonData(url, limit, offset);
    } catch (err) {
      console.error(err);
      return err;
    }
  };

  /**
   *
   * @param pokemonData : Pokemon list with name and image from intial fetch
   */
  const getPokemon = async (pokemonData: string[] | any) => {
    setIsLoading(true);
    let _pokemonObject = await Promise.all(
      pokemonData.map(async (pokemon:any) => {
        return fetchData(pokemon.url)
          .then((resp: { data: [] }) => resp.data)
          .catch((error: any) => console.error(error));
      })
    );
    setAllPokemonList(_pokemonObject);
    setIsLoading(false);
  };

  /**
   * Initial Fetch
   * Fetches 50 records as initial fetch
   */

  useEffect(() => {
    setIsLoading(true);
    fetchData("pokemon", 50)
      .then(
        async (response: {
          data: { next: string; previous: string; results: [] };
        }) => {
          if (response && response.data) {
            setNextPageURL(response.data.next);
            setPrevPageURL(response.data.previous);
            await getPokemon(response.data.results);
          } else {
            setIsLoading(false);
            setBroken(true);
          }
        }
      )
      .catch((error: any) => console.error(error));
  }, []);

  /**
   * Get next url from initial fetch
   */
  const getNext = async () => {
    await fetchData(nextPageURL)
      .then(
        async (resp: {
          data: { next: string; previous: string; results: [] };
        }) => {
          if (resp.data) {
            setNextPageURL(resp.data.next);
            setPrevPageURL(resp.data.previous);
            await getPokemon(resp.data.results);
          }
        }
      )
      .catch((error: any) => console.error(error));
  };

  /**
   * Get previous url from intial fetch
   */
  const getPrevious = async () => {
    await fetchData(prevPageURL)
      .then(
        async (resp: {
          data: { next: string; previous: string; results: [] };
        }) => {
          if (resp.data) {
            setNextPageURL(resp.data.next);
            setPrevPageURL(resp.data.previous);
            await getPokemon(resp.data.results);
          }
        }
      )
      .catch((error: any) => console.error(error));
  };

  /**
   *
   * @param e :Event
   * Sets selected pokemon value from AllPokemonList
   */
  const onPokemonSelect = (e: any) => {
    let _selectedPokemon = allPokemonList.filter(
      (item: { name: string }) => item.name === e.target.id
    );
    setSelectedPokemon(_selectedPokemon);
    setDrawerOpen(!drawerOpen);
  };

  return (
<div className="mainWrapper">
      <Container fluid>
        <HeaderComponent
          isLoading={isLoading}
          broken={broken}
          prevPageURL={prevPageURL}
          nextPageURL={nextPageURL}
          getPrevious={getPrevious}
          getNext={getNext}
          drawerOpen={drawerOpen}
        />
        <Row className="mainRow">
          {!broken ? (
            <Fragment>
              {isLoading ? (
                <Loader />
              ) : (
                <Fragment>
                  <SlideDrawer
                    show={drawerOpen}
                    selectedPokemon={selectedPokemon[0] || []}
                  />
                  <div
                    id="backdrop"
                    style={{ display: drawerOpen ? "block" : "none" }}
                    onClick={() => setDrawerOpen(false)}
                  />

                  {allPokemonList &&
                    allPokemonList.map((pokemon: any) => {
                      return (
                        <Col xs={6} lg={3} key={pokemon.id}>
                          <Card className="pokemonBody" key={pokemon.id}>
                            <LazyLoadImage
                              src={
                                pokemon.sprites.other.dream_world
                                  .front_default || pokemon.sprites.front_shiny
                              }
                              effect="blur"
                              width="100"
                              height="100"
                              alt={pokemon.name}
                              key={pokemon.id}
                            ></LazyLoadImage>
                            <Card.Body>
                              <Card.Title className={"pokemonName"}>
                                {pokemon.name}
                              </Card.Title>
                              <Button
                                onClick={onPokemonSelect}
                                id={pokemon.name}
                              >
                                Pokémon GO
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                </Fragment>
              )}
            </Fragment>
          ) : (
            <Broken />
          )}
        </Row>
      </Container>
    </div>
  );
}
